
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const TIME_ZONE = "America/Argentina/Buenos_Aires";

// Fecha inicial del calendario ficticio.
const START_DATE = new Date("2026-10-27T00:00:00-03:00");

function argentinaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function fictionalDate() {
  const parts = argentinaDate().split("-").map(Number);
  const today = Date.UTC(parts[0], parts[1] - 1, parts[2]);

  const start = Date.UTC(
    START_DATE.getUTCFullYear(),
    START_DATE.getUTCMonth(),
    START_DATE.getUTCDate()
  );

  const elapsedDays = Math.max(
    0,
    Math.floor((today - start) / 86400000)
  );

  const result = new Date(START_DATE);
  result.setUTCMonth(result.getUTCMonth() + elapsedDays);

  return result.toLocaleDateString("es-ES", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

client.once("ready", () => {
  console.log(`Calendario Global conectado como ${client.user.tag}`);
  console.log(`Fecha ficticia actual: ${fictionalDate()}`);
  console.log("Zona horaria: Argentina (UTC-3)");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "fecha") {
    await interaction.reply({
      content: `📅 **Calendario Global**\nFecha del roleplay: **${fictionalDate()}**\nZona horaria: Argentina (UTC-3).`,
      ephemeral: false,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
