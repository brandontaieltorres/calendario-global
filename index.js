
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const CHANNEL_ID = "1564707245747478659";

// Inicio: 27 de octubre de 2026, 14:16, hora de Argentina.
const START_AT = new Date("2026-10-27T14:16:00-03:00");
const DAY_MS = 24 * 60 * 60 * 1000;

function getMonthsElapsed() {
  return Math.max(
    0,
    Math.floor((Date.now() - START_AT.getTime()) / DAY_MS)
  );
}

function fictionalDate(monthOffset = getMonthsElapsed()) {
  const date = new Date(Date.UTC(2026, 9, 27));
  date.setUTCMonth(date.getUTCMonth() + monthOffset);

  return date.toLocaleDateString("es-ES", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getNextChange() {
  return new Date(
    START_AT.getTime() + (getMonthsElapsed() + 1) * DAY_MS
  );
}

function formatArgentinaDate(date) {
  return date.toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    dateStyle: "long",
    timeStyle: "short",
  });
}

function getRemainingTime() {
  const remaining = Math.max(
    0,
    getNextChange().getTime() - Date.now()
  );

  const totalMinutes = Math.floor(remaining / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours} horas y ${minutes} minutos`;
}

function getHistory(limit = 12) {
  const currentMonth = getMonthsElapsed();
  const firstMonth = Math.max(0, currentMonth - limit);
  const entries = [];

  for (let month = firstMonth; month <= currentMonth; month++) {
    entries.push(
      `${month === currentMonth ? "🟢" : "📅"} **${fictionalDate(month)}**` +
      (month === 0 ? " — Inicio del calendario" : "")
    );
  }

  return entries;
}

// Actualiza el mensaje fijo con la fecha actual.
async function publishDate() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {
      console.error("No se encontró el canal del calendario.");
      return;
    }

    const messages = await channel.messages.fetch({ limit: 100 });

    const previousMessage = messages.find(
      (message) =>
        message.author.id === client.user.id &&
        message.content.includes("CALENDARIO MUNDIAL")
    );

    const content =
      `🌎 **CALENDARIO MUNDIAL**\n\n` +
      `📅 Fecha del roleplay: **${fictionalDate()}**\n` +
      `🕒 Cada 24 horas reales avanza un mes ficticio.\n` +
      `🤝 La fecha es compartida por todas las naciones.`;

    if (previousMessage) {
      await previousMessage.edit(content);
      console.log(`Fecha actualizada: ${fictionalDate()}`);
    } else {
      await channel.send(content);
      console.log(`Fecha publicada: ${fictionalDate()}`);
    }
  } catch (error) {
    console.error("No se pudo actualizar el calendario:", error);
  }
}

// Publica un aviso nuevo cada vez que comienza un mes ficticio.
async function publishMonthAnnouncement() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {
      console.error("No se encontró el canal para el aviso mensual.");
      return;
    }

    await channel.send({
      content:
        `@everyone\n\n` +
        `🌎 **¡COMIENZA UN NUEVO MES EN EL ROLEPLAY!**\n\n` +
        `📅 La fecha mundial ahora es: **${fictionalDate()}**\n` +
        `🕒 Han transcurrido 24 horas reales.\n` +
        `🤝 Todas las naciones comparten esta fecha.\n\n` +
        `— **Calendario Global**`,
      allowedMentions: { parse: ["everyone"] },
    });

    console.log(`Aviso mensual publicado: ${fictionalDate()}`);
  } catch (error) {
    console.error("No se pudo publicar el aviso mensual:", error);
  }
}

const commands = [
  new SlashCommandBuilder()
    .setName("fecha")
    .setDescription("Consultar la fecha actual del roleplay"),

  new SlashCommandBuilder()
    .setName("proxima-fecha")
    .setDescription("Consultar cuándo comienza el próximo mes ficticio"),

  new SlashCommandBuilder()
    .setName("calendario")
    .setDescription("Consultar las reglas del Calendario Global"),

  new SlashCommandBuilder()
    .setName("tiempo")
    .setDescription("Consultar cuánto falta para el próximo mes ficticio"),

  new SlashCommandBuilder()
    .setName("historial")
    .setDescription("Consultar las fechas anteriores del calendario")
    .addIntegerOption((option) =>
      option
        .setName("cantidad")
        .setDescription("Cantidad de meses anteriores que deseas consultar")
        .setMinValue(1)
        .setMaxValue(12)
        .setRequired(false)
    ),
];

client.once("ready", async () => {
  console.log(`Calendario Global conectado: ${client.user.tag}`);

  try {
    await client.application.commands.set(
      commands.map((command) => command.toJSON())
    );

    console.log("Los cinco comandos se registraron correctamente.");
  } catch (error) {
    console.error("Error registrando los comandos:", error);
  }

  await publishDate();

  // Evita enviar un aviso al iniciar o reiniciar el bot.
  let lastMonth = getMonthsElapsed();

  setInterval(async () => {
    const currentMonth = getMonthsElapsed();

    if (currentMonth > lastMonth) {
      lastMonth = currentMonth;

      await publishDate();
      await publishMonthAnnouncement();
    }
  }, 60 * 1000);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  switch (interaction.commandName) {
    case "fecha":
      await interaction.reply(
        `📅 **Fecha actual del roleplay:** ${fictionalDate()}`
      );
      break;

    case "proxima-fecha":
      await interaction.reply(
        `🌎 **Próximo cambio del calendario**\n` +
        `📅 Nueva fecha ficticia: **${fictionalDate(getMonthsElapsed() + 1)}**\n` +
        `🕒 Cambio previsto: **${formatArgentinaDate(getNextChange())}**`
      );
      break;

    case "calendario":
      await interaction.reply(
        `🌎 **CALENDARIO GLOBAL**\n\n` +
        `📅 Fecha actual: **${fictionalDate()}**\n` +
        `⏳ Cada 24 horas reales avanza un mes ficticio.\n` +
        `🤝 Todas las naciones comparten la misma fecha.\n` +
        `🕒 Zona horaria de referencia: Argentina (UTC−3).\n` +
        `🔄 El calendario calcula la fecha automáticamente, incluso después de una desconexión.`
      );
      break;

    case "tiempo":
      await interaction.reply(
        `⏳ **Tiempo hasta el próximo mes ficticio**\n\n` +
        `🕒 Faltan aproximadamente **${getRemainingTime()}**.\n` +
        `📅 Próxima fecha: **${fictionalDate(getMonthsElapsed() + 1)}**`
      );
      break;

    case "historial": {
      const limit = interaction.options.getInteger("cantidad") ?? 12;
      const history = getHistory(limit);

      await interaction.reply(
        `📚 **HISTORIAL DEL CALENDARIO GLOBAL**\n\n` +
        `🌎 Inicio: **27 de octubre de 2026**\n` +
        `📅 Fecha actual: **${fictionalDate()}**\n\n` +
        history.join("\n") +
        `\n\n🕒 Cada 24 horas reales avanza un mes ficticio.`
      );
      break;
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
