import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendResetEmail } from "../libs/mailer.js";
dotenv.config();

/**
 * Registers a new user in the system.
 * @async
 * @function registerUser
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const registerUser = async (req, res) => {
  const { name, lastname, age, email, password } = req.body;

  try {
    const userFound = await User.findOne({ email });
    if (userFound) {
      return res.status(409).json(["Este correo ya está registrado"]);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      lastname,
      age,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    res.status(201).json({
      id: savedUser._id,
      email: savedUser.email,
      name: savedUser.name,
      lastname: savedUser.lastname,
      age: savedUser.age,
    });
  } catch (error) {
    res.status(500).json(["Intenta de nuevo más tarde"]);
  }
};

/**
 * Authenticates a user and returns a token if credentials are valid.
 * @async
 * @function loginUser
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userFound = await User.findOne({ email });
    if (!userFound)
      return res.status(400).json({ message: "Correo o contraseña inválidos" });

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ message: "Correo o contraseña inválidos" });

    const token = await createAccessToken({ id: userFound._id });

    res.cookie("token", token, {
      httpOnly: true,
    });

    res.status(200).json({
      id: userFound._id,
      name: userFound.name,
      lastname: userFound.lastname,
      age: userFound.age,
      email: userFound.email,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Intenta de nuevo más tarde" });
  }
};

export const verifyToken = async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.send(false);

  jwt.verify(token, process.env.TOKEN_SECRET, async (error, user) => {
    if (error) return res.status(401).json({ message: "Token inválido" });

    const userFound = await User.findById(user.id);
    if (!userFound) return res.status(401).json({ message: "Usuario no encontrado" });

    return res.json({
      id: userFound._id,
      name: userFound.name,
      lastname: userFound.lastname,
      age: userFound.age,
      email: userFound.email,
    });
  });
};

export const profile = async (req, res) => {
  const userFound = await User.findById(req.user.id);
  if (!userFound)
    return res.status(400).json({ message: "Usuario no encontrado" });

  return res.json({
    id: userFound._id,
    name: userFound.name,
    lastname: userFound.lastname,
    age: userFound.age,
    email: userFound.email,
    createdAt: userFound.createdAt,
    updatedAt: userFound.updatedAt,
  });
};

/**
 * Logs out the current user by clearing the authentication cookie.
 * @async
 * @function logout
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,

    expires: new Date(0),
  });
  return res.sendStatus(200);
};

/**
 * Sends a password reset email with a secure, single-use token valid for 1 hour.
 * @async
 * @function forgotPassword
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.sendStatus(202);

  // Crea un JWT con el id del usuario y expira en 1 hora
  const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: "1h",
  });

  // Guarda el token en el usuario para invalidarlo tras el primer uso
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/reset?token=${token}`;
  await sendResetEmail(user.email, resetLink);
  //console.log(`Enviar email a ${email} con link: ${resetLink}`);

  return res.sendStatus(200);
};

/**
 * Resets the user's password using a valid, single-use token.
 * @async
 * @function resetPassword
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  let payload;
  try {
    payload = jwt.verify(token, process.env.TOKEN_SECRET);
  } catch {
    return res.status(400).json({ message: "Enlace inválido o caducado" });
  }

  // Busca el usuario con ese token y que no haya expirado
  const user = await User.findOne({
    _id: payload.id,
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ message: "Enlace inválido o caducado" });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  return res.sendStatus(200);
};
