$(document).ready(() => {

    var welcome =            "    ██████  ██▓ ██▓ ███▄ ▄███▓  ██████ ▓█████  ██ ▄█▀\n" +
            "    ▒██    ▒ ▓██▒▓██▒▓██▒▀█▀ ██▒▒██    ▒ ▓█   ▀  ██▄█▒\n" +
            "    ░ ▓██▄   ▒██▒▒██▒▓██    ▓██░░ ▓██▄   ▒███   ▓███▄░\n" +
            "      ▒   ██▒░██░░██░▒██    ▒██   ▒   ██▒▒▓█  ▄ ▓██ █▄\n" +
            "    ▒██████▒▒░██░░██░▒██▒   ░██▒▒██████▒▒░▒████▒▒██▒ █▄\n" +
            "    ▒ ▒▓▒ ▒ ░░▓  ░▓  ░ ▒░   ░  ░▒ ▒▓▒ ▒ ░░░ ▒░ ░▒ ▒▒ ▓▒\n" +
            "    ░ ░▒  ░ ░ ▒ ░ ▒ ░░  ░      ░░ ░▒  ░ ░ ░ ░  ░░ ░▒ ▒░\n" +
            "   ░  ░  ░   ▒ ░ ▒ ░░      ░   ░  ░  ░     ░   ░ ░░ ░\n" +
            "          ░   ░   ░         ░         ░     ░  ░░  ░\n";

    var term = $("<body>").terminal({
        help: () => {
            term.echo("\nCurrent commands:\n\n[[b;#00FF41;#222]about] - :)\n[[b;#00FF41;#222]github] - My personal Github.\n[[b;#00FF41;#222]projects] - My projects.\n")
        },
        github: () => {
            term.echo("\nhttps://github.com/siimsek\n");
        },
        projects: () => {
            term.echo("\nMy projects:\n\n[[b;#00FF41;#222]Compline] - An online complier.\n           Supports Python, C, C++, C#, Java, Swift, PHP, Rust and GO.\n\n[[b;#00FF41;#222]Lightning Kernel] - Kernel for Xiaomi Redmi Note 8\n");
        },
        about: () => {
            term.echo("\n[[b;#00FF41;#222]# Muhammed Ali Şimşek]\nElectrical-Electronics Engineering student.\n");
        },
    }, {
        greetings: () => {
            return welcome;
        }
    });

    term.echo("Type [[b;#00FF41;#222]help] for a list of available commands.\n")

    console.log($(window).width())

});
