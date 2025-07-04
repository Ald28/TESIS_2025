const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const enviarCorreoCitaAceptada = async ({ para, nombreEstudiante, fecha, horaInicio, horaFin }) => {
  const msg = {
    to: para,
    from: process.env.EMAIL_SENDER,
    subject: 'Confirmación de cita psicológica - CalmaTec',
    html: `
      <h2>Hola ${nombreEstudiante},</h2>
      <p>Tu cita con el psicólogo ha sido <strong>aceptada</strong>.</p>
      <p><strong>Fecha:</strong> ${fecha}</p>
      <p><strong>Hora:</strong> ${horaInicio} a ${horaFin}</p>
      <p>Por favor revisa tu correo y/o Google Calendar para más detalles.</p>
      <br />
      <p>Gracias por usar <strong>CalmaTec</strong>.</p>
    `,
  };

  await sgMail.send(msg);
};

module.exports = {
  enviarCorreoCitaAceptada,
};