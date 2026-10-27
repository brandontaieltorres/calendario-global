
const {
  Client,
  GatewayIntentBits,
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Inicio del calendario: 27 de octubre de 2026,
// a las 14:16, hora de Argentina.
const START_AT = new Date("2026-10-27T14:16:00-03:00");
const DAY_MS = 24 * 60 * 60 * 1000;

function fictionalDate() {
  const elapsed = Math.max(
    0,
    Date.now() - START_AT.getTime()
  );

  const monthsElapsed = Math.floor(elapsed / DAY_MS);

  const date = new Date(Date.UTC(2026, 9, 27));
  date.setUTCMonth(date.getUTCMonth() + monthsElapsed);

  return date.toLocaleDateString("es-ES", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

client.once("ready", async () => {
  console.log(`Calendario Global conectado: ${client.user.tag}`);

  try {
    await client.application.commands.set([
      {
        name: "fecha",
        description: "Consultar la fecha actual del roleplay",
      },
    ]);

    console.log("Comando /fecha registrado correctamente.");
    console.log(`Fecha ficticia: ${fictionalDate()}`);
  } catch (error) {
    console.error("Error al registrar /fecha:", error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "fecha") return;

  await interaction.reply({
    content:
      `📅 **Calendario Global**\n` +
      `Fecha del roleplay: **${fictionalDate()}**\n` +
      `Cada 24 horas reales avanza un mes ficticio.`,
  });
});

client.login(process.env.DISCORD_TOKEN);
