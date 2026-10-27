
const {
  Client,
  GatewayIntentBits,
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const CHANNEL_ID = "1564707245747478659";

// Inicio: 27 de octubre de 2026, 14:16 de Argentina.
const START_AT = new Date("2026-10-27T14:16:00-03:00");
const DAY_MS = 24 * 60 * 60 * 1000;

function getMonthsElapsed() {
  return Math.max(
    0,
    Math.floor((Date.now() - START_AT.getTime()) / DAY_MS)
  );
}

function fictionalDate() {
  const date = new Date(Date.UTC(2026, 9, 27));
  date.setUTCMonth(date.getUTCMonth() + getMonthsElapsed());

  return date.toLocaleDateString("es-ES", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function publishDate() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {
      console.error("No se encontró el canal del calendario.");
      return;
    }

    await channel.send(
      `🌎 **CALENDARIO MUNDIAL**\n\n` +
      `📅 Fecha del roleplay: **${fictionalDate()}**\n` +
      `🕒 Cada 24 horas reales avanza un mes ficticio.\n` +
      `🤝 La fecha es compartida por todas las naciones.`
    );

    console.log(`Fecha publicada: ${fictionalDate()}`);
  } catch (error) {
    console.error("No se pudo publicar la fecha:", error);
  }
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
  } catch (error) {
    console.error("Error registrando /fecha:", error);
  }

  // Publica la fecha actual al iniciar.
  await publishDate();

  // Comprueba cada minuto si comenzó un nuevo mes ficticio.
  let lastMonth = getMonthsElapsed();

  setInterval(async () => {
    const currentMonth = getMonthsElapsed();

    if (currentMonth > lastMonth) {
      lastMonth = currentMonth;
      await publishDate();
    }
  }, 60 * 1000);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "fecha") return;

  await interaction.reply(
    `📅 **Calendario Global**\n` +
    `Fecha del roleplay: **${fictionalDate()}**\n` +
    `Cada 24 horas reales avanza un mes ficticio.`
  );
});

client.login(process.env.DISCORD_TOKEN);
