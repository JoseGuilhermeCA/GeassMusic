const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Mostra a musica atual na fila")
    .addNumberOption((option) => option.setName("page").setDescription("Numero da pagina na fila").setMinValue(1)),

    run: async ({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId)
        if (!queue || !queue.playing){
            return await interaction.editReply("Não ha musicas na fila")
        }

        const totalPages = Math.ceil(queue.tracks.length / 10) || 1
        const page = (interaction.options.getNumber("Pagina") || 1) - 1

        if (page + 1 > totalPages) 
            return await interaction.editReply(`Pagina invalida. O total de paginas na fila é  ${totalPages} Total de paginas`)
        
        const queueString = queue.tracks.slice(page * 10, page * 10 + 10).map((song, i) => {ho
            return `**${page * 10 + i + 1}.** \`[${song.duration}]\` ${song.title} -- <@${song.requestedBy.id}>`
        }).join("\n")

        const currentSong = queue.current

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**Tocando agora**\n` + 
                    (currentSong ? `\`[${currentSong.duration}]\` ${currentSong.title} -- <@${currentSong.requestedBy.id}>` : "None") +
                    `\n\n**Queue**\n${queueString}`
                    )
                    .setFooter({
                        text: `Page ${page + 1} of ${totalPages}`
                    })
                    .setThumbnail(currentSong.setThumbnail)
            ]
        })
    }
}