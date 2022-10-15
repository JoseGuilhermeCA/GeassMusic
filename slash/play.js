const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { QueryType } = require("discord-player")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Reproduz uma musica do youtube")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("musica")
				.setDescription("Reproduz uma unica musica de uma url")
				.addStringOption((option) => option.setName("url").setDescription("Musica da sua url").setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("playlist")
				.setDescription("Reproduz uma playlist de uma url")
				.addStringOption((option) => option.setName("url").setDescription("Playlist da sua url").setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("pesquisa")
				.setDescription("Procura uma musica baseada nas palavras chaves")
				.addStringOption((option) =>
					option.setName("pesquisa").setDescription("Palavras chaves de busca").setRequired(true)
				)
		),
	run: async ({ client, interaction }) => {
		if (!interaction.member.voice.channel) return interaction.editReply("Voce deveria estar em um canal de voz")

		const queue = await client.player.createQueue(interaction.guild)
		if (!queue.connection) await queue.connect(interaction.member.voice.channel)

		let embed = new EmbedBuilder()

		if (interaction.options.getSubcommand() === "musica") {
            let url = interaction.options.getString("url")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO
            })
            if (result.tracks.length === 0)
                return interaction.editReply("Sem resultados")
            
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** Foi adicionado a fila`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duração: ${song.duration}`})

		} else if (interaction.options.getSubcommand() === "playlist") {
            let url = interaction.options.getString("url")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST
            })

            if (result.tracks.length === 0)
                return interaction.editReply("Sem resultados")
            
            const playlist = result.playlist
            await queue.addTracks(result.tracks)
            embed
                .setDescription(`**${result.tracks.length} musicas [${playlist.title}](${playlist.url})** Foi adicionado a fila`)
                .setThumbnail(playlist.thumbnail)
		} else if (interaction.options.getSubcommand() === "pesquisa") {
            let url = interaction.options.getString("pesquisa")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })

            if (result.tracks.length === 0)
                return interaction.editReply("Sem resultados")
            
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** Foi adicionado a fila`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duração: ${song.duration}`})
		}
        if (!queue.playing) await queue.play()
        await interaction.editReply({
            embeds: [embed]
        })
	},
}