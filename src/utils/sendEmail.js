require("dotenv").config();
const nodemailer = require("nodemailer");

exports.sendEmail = (options) =>
  new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_HOST,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_HOST,
      ...options,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      console.log(error, info);
      if (error) {
        console.log(error);
        return reject({ message: "An error has occured" });
      }
      return resolve({ message: "Email sent successfully" });
    });
  });

exports.sendEmailCodeVerificationAccount = async (user, code) => {
  try {
    const verificationUrl = `${
      process.env.FRONTEND_URL
    }/verify-email?code=${encodeURIComponent(code)}?userType=${user.role}`;

    await exports.sendEmail({
      to: user.email,
      subject: "Verificación de correo electrónico",
      html: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.4; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="font-size: 24px; margin-bottom: 10px; text-align: center;">
          <span style="color: #007bff;">¡Hola ${user.username}!</span><br>
          Gracias por registrarte en streaming HN.
        </h1>
  <p style="font-size: 16px; margin-bottom: 20px; text-align: center;">
          Por favor, verifica tu correo electrónico haciendo clic en el siguiente botón:
        </p>
        <div style="text-align: center;">
          <a href="${verificationUrl}" target="_self" style="text-decoration: none; display: inline-block;">
            <button style="background-color: #007bff; /* Azul */
                           border: none;
                           color: white;
  padding: 15px 30px;
                           font-size: 16px;
                           cursor: pointer;
                           border-radius: 5px;
                           width: fit-content; /* Ajusta el ancho al contenido */
                           ">Verificar correo electrónico</button>
          </a>
        </div>
        <p style="font-size: 14px; margin-top: 30px; text-align: center; color: #777;">Si tienes problemas para verificar tu correo, copia y pega el siguiente enlace en tu navegador:<br>
        <a href="${verificationUrl}" style="color: #007bff; text-decoration: underline; word-break: break-all;">${verificationUrl}</a>
        </p>
<p style="font-size: 14px; margin-top: 30px; text-align: center; color: #777;">Comuniquese con soporte:<br>
        <a href="https://api.whatsapp.com/send?phone=${+51967203678}&text=Hola!! HN, no puedo verificar mi correo ${encodeURIComponent(
        user.email
      )} me podría ayudar" style="color:rgb(61, 230, 75); text-decoration: underline; word-break: break-all;">+51967203678</a>
        </p>
    </div>`,
    });
  } catch (error) {
    console.log({ errorNodemailer: error });
    throw new Error("No se pudo enviar el correo de verificación");
  }
};

exports.sendEmailCodeRecoverPassword = (user, code) => {
  const changePasswordUrl = `${
    process.env.FRONTEND_URL
  }/change-password?code=${encodeURIComponent(code)}?userType=${user.role}`;

  try {
    return exports.sendEmail({
      to: user.email,
      subject: "Recuperación de contraseña",
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.4; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="font-size: 24px; margin-bottom: 10px; text-align: center;">
          <span style="color: #007bff;">¡Hola ${user.username}!</span><br>
          ¿Olvidaste tu contraseña?
        </h1>
        <p style="font-size: 16px; margin-bottom: 20px; text-align: center;">
          Por favor, haz click en el siguiente botón para recuperar tu contraseña:
        </p>
        <div style="text-align: center;">
          <a href="${changePasswordUrl}" target="_self" style="text-decoration: none; display: inline-block;">
            <button style="background-color: #007bff; /* Azul */
                           border: none;
                           color: white;
                           padding: 15px 30px;
                           font-size: 16px;
                           cursor: pointer;
                           border-radius: 5px;
                           width: fit-content; /* Ajusta el ancho al contenido */
                           ">Recuperar contraseña</button>
          </a>
        </div>
        <p style="font-size: 14px; margin-top: 30px; text-align: center; color: #777;">Si tienes problemas para verificar tu correo, copia y pega el siguiente enlace en tu navegador:<br>
        <a href="${changePasswordUrl}" style="color: #007bff; text-decoration: underline; word-break: break-all;">${changePasswordUrl}</a>
        </p>
<p style="font-size: 14px; margin-top: 30px; text-align: center; color: #777;">Comuniquese con soporte:<br>
        <a href="https://api.whatsapp.com/send?phone=${+51967203678}&text=Hola!! HN, no puedo recuperar mi contraseña ${encodeURIComponent(
        user.email
      )} me podría ayudar" style="color:rgb(61, 230, 75); text-decoration: underline; word-break: break-all;">+51967203678</a>
        </p>
      </div>
      `,
    });
  } catch (error) {
    console.log(error);
    throw new Error("No se pudo enviar el correo de verificación");
  }
};

exports.sendEmailCodeChangeTelephone = (user, code) => {
  const changePasswordUrl = `${
    process.env.FRONTEND_URL
  }/change-telephone?code=${encodeURIComponent(code)}?userType=${user.role}`;

  try {
    return exports.sendEmail({
      to: user.email,
      subject: "Cambio de teléfono",
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.4; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="font-size: 24px; margin-bottom: 10px; text-align: center;">
          <span style="color: #007bff;">¡Hola ${user.username}!</span><br>
          Cambio de teléfono
        </h1>
        <p style="font-size: 16px; margin-bottom: 20px; text-align: center;">
          Por favor, haz click en el siguiente botón para cambiar tu teléfono:
        </p>
        <div style="text-align: center;">
          <a href="${changePasswordUrl}" target="_self" style="text-decoration: none; display: inline-block;">
            <button style="background-color: #007bff; /* Azul */
                           border: none;
                           color: white;
                           padding: 15px 30px;
                           font-size: 16px;
                           cursor: pointer;
                           border-radius: 5px;
                           width: fit-content; /* Ajusta el ancho al contenido */
                           ">Cambiar teléfono</button>
          </a>
        </div>
        <p style="font-size: 14px; margin-top: 30px; text-align: center; color: #777;">Si tienes problemas para verificar tu correo, copia y pega el siguiente enlace en tu navegador:<br>
        <a href="${changePasswordUrl}" style="color: #007bff; text-decoration: underline; word-break: break-all;">${changePasswordUrl}</a>
        </p>
      </div>
      `,
    });
  } catch (error) {
    console.log(error);
    throw new Error("No se pudo enviar el correo de verificación");
  }
};
