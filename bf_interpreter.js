const { randomInt } = require("crypto");
const Discord = require("discord.js");
const client = new Discord.Client();
var fs = require("fs");
const readline = require("readline");

const cron = require("node-cron");

//メンションを受け取ったら
client.on("message", (msg) => {
	if (!msg.author.bot) {
		if (msg.mentions.has(client.user)) {
			var content = msg.content;
			var code = "";
			var input = "";

			//読込
			{
				console.log(content);
				console.log("-----");

				//コード取得
				{
					var p_s = content.indexOf("```");
					if (p_s == -1) return;

					content = content.substring(p_s + 4);

					var p_e = content.indexOf("```");
					if (p_e == -1) return;

					code = content.substring(0, p_e - 1);

					content = content.substring(p_e + 3);

					var result = code.match(/[\+\-<>\[\]\.\,]*/g);
					code = "";
					for(var i = 0; i < result.length; ++i)
					{
						code += result[i];
					}
				}

				console.log(code);
				console.log("-----");

				//標準入力取得
				{
					var p_s = content.indexOf("```");
					if (p_s != -1) {

						content = content.substring(p_s + 4);

						var p_e = content.indexOf("```");
						if (p_e == -1) return;

						input = content.substring(0, p_e);

						content = content.substring(p_e + 3);
					}
				}

				console.log(input);
				console.log("-----");
			}

			///実行
			{
				var index = 0;
				var ptr = 0;
				var ptr_input = 0;
				var memory = new Array(128).fill(0);
				var output = "";

				while(index < code.length)
				{
					const t = code[index];

					//メモリ加算
					if(t == "+")
					{
						++memory[ptr];
						if(memory[ptr] >= 256)
						{
							return;
						}

						++index;
					}
					//メモリ減算
					else if(t == "-")
					{
						--memory[ptr];
						if(memory[ptr] < 0)
						{
							return;
						}

						++index;
					}
					//ポインタ加算
					else if(t == ">")
					{
						++ptr;
						if(ptr >= memory.length)
						{
							return;
						}

						++index;
					}
					//ポインタ減算
					else if(t == "<")
					{
						--ptr;
						if(ptr < 0)
						{
							return;
						}

						++index;
					}
					//ループ始端
					else if(t == "[")
					{
						if(memory[ptr] != 0)
						{
							++index;
						}
						else
						{
							var count = 1;
							for(var i = index + 1; i < code.length; ++i)
							{
								if(code[i] == "[")
								{
									++count;
								}
								else if(code[i] == "]")
								{
									--count;

									if(count == 0)
									{
										index = i;
										break;
									}
								}
							}

							if(count != 0)
							{
								return;
							}
						}
					}
					//ループ終端
					else if(t == "]")
					{
						if(memory[ptr] == 0)
						{
							++index;
						}
						else
						{
							var count = 1;
							for(var i = index - 1; i > 0; --i)
							{
								if(code[i] == "]")
								{
									++count;
								}
								else if(code[i] == "[")
								{
									--count;

									if(count == 0)
									{
										index = i;
										break;
									}
								}
							}

							if(count != 0)
							{
								return;
							}
						}
					}
					//標準出力
					else if(t == ".")
					{
						output += String.fromCharCode(memory[ptr]);
						++index;
					}
					//標準入力
					else if(t == ",")
					{
						if(ptr_input >= input.length)
						{
							return;
						}

						memory[ptr] = input[ptr_input].charCodeAt(0);
						++ptr_input;

						++index;
					}
					else
					{
						++index;
					}

					//console.log(memory);
				}
			}

			//console.log(output);

			//出力
			{
				var result = "";
				//result += "実行結果\n";
				result += "```\n";
				result += output;
				result += "\n```";
				msg.channel.send(result);
			}

			//msg.delete();
		}
	}
});

//トークン
client.login(
	"Token"
);
