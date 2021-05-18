var is_prompt = 0;
var must_step = 0;
var checker_name;
var checkers;
var taggeds = [];
var red_flag = false;
var last_vector = {x : 0, y : 0};
var step = 1;
var global_list = [];
var delete_list = [];
var is_win = 0;
var record = "";
var end_step = 1;
var message;
var enemy_coords = {x : 0, y : 0};

function record_write(exp_arr) {
	var tbody = document.getElementById("record_table");
	for(var i = 0; i < exp_arr.length; i++) {
		if((i + step) % 2 == 0) {
		    var row = document.createElement("TR");
		    var td1 = document.createElement("TD");
		    td1.appendChild(document.createTextNode(exp_arr[i]));
		    var td2 = document.createElement("TD");
		    row.appendChild(td1);
		    row.appendChild(td2);
		    tbody.appendChild(row);
		} else {
			var lastRow = tbody.rows.length - 1;
			var td2 = document.getElementById("record_table").rows[lastRow].getElementsByTagName("TD")[1];
			td2.appendChild(document.createTextNode(exp_arr[i]));
		}
	}
}

function cut_handler(arr, color) {
	must = 0;
	var arr1 = cell_parser(arr[0]);
	var arr2;
	if(checkers[arr1.i][arr1.j] % 2 != color) {
		message = "Неподходящий цвет шашки (" + arr[0] + ")";
		return false;
	}
	for(var i = 1; i < arr.length; i++) {
		arr2 = cell_parser(arr[i]);
		if(arr[i - 1] === arr[i]) {
			message = "Попытка сделать шаг на месте";
			return false;
		}
		if(checkers[arr2.i][arr2.j] != 0) {
			message = "Место, которое совершается шаг - не пусто (из " + arr[0] + " в " + arr[1] + ")";
			return false;
		}
		if(!obligatory_move(arr1.i, arr1.j, arr2.i, arr2.j, checkers[arr1.i][arr1.j])) {
			message = "Отсутствует взятие (из " + arr[i-1] + " в " + arr[i] + ")";
			return false;
		}
		must = 1;
		checkers[arr2.i][arr2.j] = checkers[arr1.i][arr1.j];
		checkers[arr1.i][arr1.j] = 0;
		checkers[enemy_coords.x][enemy_coords.y] = 0;
		if(checkers[arr2.i][arr2.j] <= 2 && arr2.i == 7 - 7*(checkers[arr2.i][arr2.j] % 2)) {
			checkers[arr2.i][arr2.j] += 2;
		}
		arr1 = arr2;
	}
	if(obligatory_move(arr1.i, arr1.j, -1, 0, checkers[arr1.i][arr1.j])) {
		message = "Неполная цепочка взятия (из " + arr[0] + " в " + arr[arr.length-1] + ")";
		return false;
	}
	return true;
}

function obligatory_move(x, y, x1, y1, color) {
	for(var k = 0; k <= 8; k += 2) {
		if(k == 4) {
			continue;
		}
		var vec = {x : k % 3 - 1, y : Math.floor(k / 3) - 1};
		var i = x;
		var j = y;
		var block = 0;
		for(;i >= 0 && j >= 0 && i <= 7 && j <= 7;) {
			i += vec.x;
			j += vec.y;
			if(i >= 0 && j >= 0 && i <= 7 && j <= 7) {
				var dir = 1 - (color % 2) * 2;
				if(checkers[i][j] % 2 != checkers[x][y] % 2 && checkers[i][j] != 0 && block == 0) {
					if((i == x + dir || i == x - dir || color > 2) 
						&& !(must_step == 1 && last_vector.x == -Math.sign(i-x) && last_vector.y == -Math.sign(j-y))) {
						block = 1;
						enemy_coords.x = i;
						enemy_coords.y = j;
						//console.log("ENE " + i + " " + j);
					}
				} else if(checkers[i][j] == 0 && block == 1) {
					if((i == x + 2 || i == x - 2 || color > 2) && ((i == x1 && j == y1) || x1 == -1)) {
						last_vector.x = Math.sign(i-x);
						last_vector.y = Math.sign(j-y);
						//console.log("EM " + i + " " + j);
						return true;
					}
				} else if(checkers[i][j] != 0 && block == 1) {
					break;
				}
			}
		}
	}
	return false;
}

function step_handler(arr, color) {
	var arr1 = cell_parser(arr[0]);
	var arr2 = cell_parser(arr[1]);
	if(arr[0] === arr[1]) {
		message = "Попытка сделать шаг на месте";
		return false;
	}
	if(checkers[arr1.i][arr1.j] % 2 != color) {
		message = "Неподходящий цвет шашки (" + arr[0] + ")";
		return false;
	}

	if(checkers[arr2.i][arr2.j] != 0) {
		message = "Место, которое совершается шаг - не пусто (из " + arr[0] + " в " + arr[1] + ")";
		return false;
	}

	if(Math.abs(arr1.i-arr2.i) != Math.abs(arr1.i-arr2.i) ) {
		message = "Невозможное направление для хода (из " + arr[0] + " в " + arr[1] + ")";
		return false;
	}

	if(checkers[arr1.i][arr1.j] < 2) {
		if(!((arr1.i + (1 - color * 2) == arr2.i && arr1.j + (1 - color * 2) == arr2.j) || (arr1.i + (1 - color * 2) == arr2.i && arr1.j - (1 - color * 2) == arr2.j))) {
			message = "Шаг совершается не в ту сторону (из " + arr[0] + " в " + arr[1] + ")";
			return false;
		}
	} else {
		var dir = {i:Math.sign(arr2.i - arr1.i), j:Math.sign(arr2.j - arr1.j)};
		var n = Math.abs(arr2.i - arr1.i) - 1;
		for(var i = 0; i < n; i++) {
			if(checkers[arr1.i + dir.i * i][arr1.j + dir.j * i] != 0) {
				message = "Попытка пройти дамкой через препядствие (из " + arr[0] + " в " + arr[1] + ")";
				return false;
			}
		}
	}

	for (var i = 0; i < 8; i++) {
		for(var j = 0; j < 8; j++) {
			if(checkers[i][j] % 2 == color && checkers[i][j] != 0) {
				if(obligatory_move(i, j, -1, 0, checkers[i][j])) {
					message = "Нельзя делать этот ход, так как на поле есть обязательные для взятия шашки";
					return false;
				}
			}
		}
	}

	checkers[arr2.i][arr2.j] = checkers[arr1.i][arr1.j];
	checkers[arr1.i][arr1.j] = 0;
	if(checkers[arr2.i][arr2.j] <= 2 && arr2.i == 7 - 7*(checkers[arr2.i][arr2.j] % 2)) {
		checkers[arr2.i][arr2.j] += 2;
	}
	return true;
}

function cell_parser(str) {
	var i = 8 - str[1];
	var j = str.charCodeAt(0) - 65;
	return {i:i, j:j};
}

function cell_handler(str) {
	var coords = cell_parser(str);
	return coords.i % 2 != coords.j % 2;
}

function cell_arr_handler(arr) {
	var valid = true;
	for(var i = 0; i < arr.length; i++) {
		if(!cell_handler(arr[i])) {
			message = arr[i] + " - это белая клетка";
			valid = false;
			break;
		} 
	}
	return valid;
}

function exphandler(str, color) {
	var re = /[A-H][1-8]/g;
	var arr = str.match(re);
	var cut = str.includes(":");
	if(!cell_arr_handler(arr)) {
		return false;
	}
	if(cut) {
		return cut_handler(arr, color);
	} 
	return step_handler(arr, color);
}

function show_append() {
	var local_checkers = 
			   [[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0]];
	for(var i = 0; i < 8; i++) {
		for(var j = 0; j < 8; j++) {
			local_checkers[i][j] = checkers[i][j];
		}
	}
	if(!show(step + 1, false)) {
		checkers = local_checkers;
	}
}

function show_rewrite() {
	var local_checkers = checkers;
	checkers = [[0,2,0,2,0,2,0,2],
				[2,0,2,0,2,0,2,0],
				[0,2,0,2,0,2,0,2],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[1,0,1,0,1,0,1,0],
				[0,1,0,1,0,1,0,1],
				[1,0,1,0,1,0,1,0]];
	step = 0;
	if(!show(1, true)) {
		checkers = local_checkers;
	}
}

function show(k, rewrite) {
	var text = document.getElementsByClassName("input_record_field")[0].value;
	var re = /(\s(([a-hA-H][1-8]-[a-hA-H][1-8])|([a-hA-H][1-8]((:[a-hA-H][1-8])+)))|^(([a-hA-H][1-8]-[a-hA-H][1-8])|([a-hA-H][1-8]((:[a-hA-H][1-8])+))))/g;
	var exec_array;
	var index = 0;
	var i = k;
	var error = false;
	var exp_arr = [];
	exec_array = re.exec(text);
	if(!exec_array) {
		error = true;
		message = "Некорректные данные в поле";
	}
	while(exec_array) {
		var new_index = exec_array.index;
		if(index != new_index) {
			message = "Ошибка парсинга, ошибка с разделителями";
			error = true;
			break;
		}
		index = re.lastIndex;
		error = !exphandler(exec_array[0].trim().toUpperCase(), i % 2);
		exp_arr.push(exec_array[0].trim().toUpperCase());
		if(error) {
			break;
		}
		exec_array = re.exec(text);
		i++;
	}
	if(error) {
		alert(message);
		return false;
	} else {
		if(rewrite) {
			var rows = document.getElementById("record_table").rows;
			for (var j = rows.length - 1; j >= 1 ; j--) {
				rows[j].remove();
			}
		}
		record_write(exp_arr);
		clear();
		step = i % 2;
		arrange();
		take_step();
		document.getElementsByClassName("input_record_field")[0].value = "";
		return true;
	}
}

function begin() {
	document.getElementById("complete_button").disabled = true;
	document.getElementById("cansel_button").disabled = true;
	clear();
	var rows = document.getElementById("record_table").rows;
	for (var i = rows.length - 1; i >= 1 ; i--) {
		rows[i].remove();
	}
	checkers = [[0,2,0,2,0,2,0,2],
				[2,0,2,0,2,0,2,0],
				[0,2,0,2,0,2,0,2],
				[0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[1,0,1,0,1,0,1,0],
				[0,1,0,1,0,1,0,1],
				[1,0,1,0,1,0,1,0]];
	arrange();
	step = 1;
	take_step();
}

function example_first() {
	clear();
	var rows = document.getElementById("record_table").rows;
	for (var i = rows.length - 1; i >= 1 ; i--) {
		rows[i].remove();
	}
	checkers = [[0,2,0,0,0,0,0,0],
				[0,0,2,0,2,0,0,0],
				[0,0,0,0,0,0,0,2],
				[0,0,2,0,0,0,0,0],
				[0,0,0,0,0,1,0,1],
				[3,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0],
				[0,0,4,0,0,0,0,0]];
	arrange();
	step = 1;
	take_step();
}

function clear() {
	is_prompt = 0;
	var imgs = document.getElementsByClassName("field")[0].getElementsByTagName("img");
	for (var i = imgs.length - 1; i >= 0 ; i--) {
		imgs[i].remove();
	}
	for (var i = 0; i < 8; i++) {
		for(var j = 0; j < 8; j++) {
			document.
			getElementsByClassName("field")[0].
			getElementsByTagName("table")[0].
			rows[i + 1].
			getElementsByTagName("td")[j].
			style.
			cssText = ``;
		}
	}
}

function get_color(color) {
	var str = "";
	if(color == 2) {
    	str = "check_black";
	} else if(color == 1) {
		str = "check_white";
	} else if(color == 4) {
		str = "king_black";
	} else if(color == 3) {
		str = "king_white";
	}
	return str;
}

function arrange() {
	is_prompt = 0; 
	is_win = 0; 
	end_step = 1;
	for(var i = 0; i < 8; i++) {
		for(var j = 0; j < 8; j++) {
			if(checkers[i][j] != 0) {
				var checker = document.createElement("IMG");
				checker.setAttribute("src", "../images/" + get_color(checkers[i][j]) + ".png");
				const name = {x : 7-i, y : j};
				const color = checkers[i][j];
				checker.onclick = function() {choose(name, this, color);}
				document.getElementsByClassName("field")[0].getElementsByTagName("table")[0].rows[i + 1].getElementsByTagName("td")[j].appendChild(checker);
			}
		}
	}
}

function choose(name, checker, color) {
	if(is_prompt == 0 && step == (color + 1) % 2 && is_win != 1 && end_step != 0) {
		is_prompt = 1;
		checker_name = {x : name.x, y : name.y};
		checker.style.cssText = `padding: 0;
			border: 2px solid yellow;`;
		recalculation(name, checker, color, 0);
		delete_list.push({cell : checker, x : 8 - name.x, y : name.y, color : color});
		document.getElementById("complete_button").onclick = function() {complete_step(checker);}
		document.getElementById("cansel_button").onclick = function() {cansel_step(checker);}
	} else if(is_prompt == 1 && checker_name.x == name.x && checker_name.y == name.y && must_step == 0 && end_step != 0) {
		delete_list = [];
		is_prompt = 0;
		checker.style.cssText = "";
		clear_styles("all");
		red_flag = false;
	}
}

function recalculation(name, checker, color, state) {
	var k = 0;
	global_list.forEach(function(item, i, arr) {
	    if(name.x == item.x && name.y == item.y) {
	    	k++;
	    }
	});
	if(k == 0 && global_list.length != 0 && state == 0) {
		return false;
	}

	x = name.x + 8;
	y = name.y + 8;
	red_flag = false;
	for(var k = 0; k <= 8; k += 2) {
		if(k == 4) {
			continue;
		}
		var vec = {x : k % 3 - 1, y : Math.floor(k / 3) - 1};
		var i = x;
		var j = y;
		var block = 0;
		var enemy_x = 0;
		var enemy_y = 0;
		for(;i >= 8 && j >= 8 && i <= 15 && j <= 15;) {
			i += vec.x;
			j += vec.y;
			if(i >= 8 && j >= 8 && i <= 15 && j <= 15) {
				var dir = (color % 2) * 2 - 1;
				if(checkers[7-(i % 8)][j % 8] == 0 && block == 0) {
					if(i == x + dir || color > 2) {
						var cell = document.getElementsByClassName("field")[0].getElementsByTagName("table")[0].rows[7-(i % 8) + 1].getElementsByTagName("td")[j % 8];
						cell.style.cssText = "background-color: #1FCA40;";
						const new_name = {x : i - 8, y : j - 8};
						cell.onclick = function() {move(this, checker, new_name, 0, color, null);}
						taggeds.push({i : 7-(i % 8), j : j % 8, color : 0});
					}
				} else if(checkers[7-(i % 8)][j % 8] % 2 != checkers[7-(x % 8)][y % 8] % 2 && block == 0) {
					if((i == x + dir || i == x - dir || color > 2) 
						&& !(must_step == 1 && last_vector.x == -Math.sign(i-x) && last_vector.y == -Math.sign(j-y))) {
						block = 1;
						enemy_x = i;
						enemy_y = j;
					}
				} else if(checkers[7-(i % 8)][j % 8] == 0 && block == 1) {
					if(i == x + 2 || i == x - 2 || color > 2) {
						red_flag = true;
						var cell = document.getElementsByClassName("field")[0].getElementsByTagName("table")[0].rows[7-(i % 8) + 1].getElementsByTagName("td")[j % 8];
						cell.style.cssText = "background-color: #C70039;";
						const new_name = {x : i - 8, y : j - 8};
						const enemy_pos = {x : enemy_x - 8, y : enemy_y - 8};
						cell.onclick = function() {move(this, checker, new_name, 1, color, enemy_pos);}
						taggeds.push({i : 7-(i % 8), j : j % 8, color : 1});
					}
				} else if(checkers[7-(i % 8)][j % 8] != 0 && block == 1) {
					break;
				}
			}
		}
	}
	var flag = red_flag;

	if(red_flag) { clear_styles("without_red");}
	red_flag = false;
	return flag;
}

function clear_styles(priority) {
	var i = 0;
	while(i < taggeds.length) {
		if(priority == "without_red" && taggeds[i].color == 1) {
			i++;
			continue;
		}
		var cell = document.getElementsByClassName("field")[0].getElementsByTagName("table")[0].rows[taggeds[i].i + 1].getElementsByTagName("td")[taggeds[i].j];
		cell.style.cssText = "";
		taggeds.splice(i, 1);
		cell.onclick = "";
	}
}

function move(cell, checker, new_checker_name, enemy, color, enemy_pos) {
	end_step = 0;
	button_activate(false);
	cell.appendChild(checker);
	var chessboard_name = chessboard_projection(checker_name);
	var chessboard_new_name = chessboard_projection(new_checker_name);
	var new_color = color;
	last_vector.x = Math.sign(new_checker_name.x - checker_name.x);
	last_vector.y = Math.sign(new_checker_name.y - checker_name.y);
	checkers[7-checker_name.x][checker_name.y] = 0;
	if(new_color <= 2 && new_checker_name.x == 7 - 7*(new_color - 1)){
		new_color += 2;
		checker.setAttribute("src", "../images/" + get_color(new_color) + ".png");
	}
	checkers[7-new_checker_name.x][new_checker_name.y] = new_color;
	checker_name.x = new_checker_name.x;
	checker_name.y = new_checker_name.y;
	if(enemy == 0) {
		record += chessboard_name;
		record += "-";
		record += chessboard_new_name;
		clear_styles("all");
		checker.onclick = function() {choose(new_checker_name, this, new_color);}
	} else {
		if(record == "") {
			record += chessboard_name;
		}
		record += ":";
		record += chessboard_new_name;

		must_step = 1;
		const const_color = checkers[7 - enemy_pos.x][enemy_pos.y];
		checkers[7 - enemy_pos.x][enemy_pos.y] = 0;
		clear_styles("all");
		checker.onclick = function() {choose(new_checker_name, this, new_color);}
		const copyname = {x : new_checker_name.x, y : new_checker_name.y};
		if(!recalculation(copyname, checker, new_color, 1)) {
			clear_styles("all");
			must_step = 0;
		}
		var cell = document.getElementsByClassName("field")[0].getElementsByTagName("table")[0].rows[8 - enemy_pos.x].getElementsByTagName("td")[enemy_pos.y];
		while (cell.firstChild) {
			delete_list.push({cell : cell.firstChild, x : 8 - enemy_pos.x, y : enemy_pos.y, color : const_color});
		    cell.removeChild(cell.firstChild);
		}
	}
}

function take_step() {
	step = (step + 1) % 2;
	global_list.splice(0, global_list.length);
	var win = 0;
	for(var i = 0; i < 8; i++) {
		for(var j = 0; j < 8; j++) {
			var local_checker;
			var new_color = checkers[7-i][j];
			if(new_color != 0 && (new_color + 1) % 2 == step) {
				local_checker = document.getElementsByClassName("field")[0].getElementsByTagName("table")[0].rows[8 - i].getElementsByTagName("td")[j].getElementsByTagName("img")[0];			
				const name = {x : i, y : j};
				if(recalculation(name, local_checker, new_color, 1)) {
					global_list.push(name);
				}
				win += taggeds.length;
				clear_styles("all");
			}
		}
	}
	if(win == 0) {
		is_win = 1;
		var text_content = step == 0 ? "ЧЁРНЫХ" : "БЕЛЫХ" ;
		document.getElementsByClassName("step_text")[0].style.cssText = "color:#335d2d";
		document.getElementsByClassName("step_text")[0].textContent = "ПОБЕДА " + text_content;
	} else {
		var text_color = step == 0 ? "FFFFFF" : "000000";
		var text_content = step == 0 ? "БЕЛЫХ" : "ЧЁРНЫХ";
		document.getElementsByClassName("step_text")[0].style.cssText = "color:#" + text_color;
		document.getElementsByClassName("step_text")[0].textContent = "Ход " + text_content;
	}
}

function button_activate(active) {
	document.getElementById("complete_button").disabled = active;
	document.getElementById("cansel_button").disabled = active;
	document.getElementById("show_rewrite").disabled = !active;
	document.getElementById("show_append").disabled = !active;
}

function complete_step(checker) {
	button_activate(true);
	var tbody = document.getElementById("record_table");
	end_step = 1;
	is_prompt = 0;
	checker.style.cssText = "";
	if(step == 0) {
	    var row = document.createElement("TR");
	    var td1 = document.createElement("TD");
	    td1.appendChild(document.createTextNode(record));
	    var td2 = document.createElement("TD");
	    row.appendChild(td1);
	    row.appendChild(td2);
	    tbody.appendChild(row);
	} else {
		var lastRow = tbody.rows.length - 1;
		var td2 = document.getElementById("record_table").rows[lastRow].getElementsByTagName("TD")[1];
		td2.appendChild(document.createTextNode(record));
	}
	record = "";
	delete_list = [];
	take_step();
}

function cansel_step(checker) {
	button_activate(true);
	record = "";
	end_step = 1;
	is_prompt = 0;
	checker.style.cssText = "";
	for(var i = 0; i < delete_list.length; i++) {
		var cell =  document.getElementsByClassName("field")[0].getElementsByTagName("table")[0].rows[delete_list[i].x].getElementsByTagName("td")[delete_list[i].y];
		cell.appendChild(delete_list[i].cell);
		var old = cell.firstChild;
		const new_checker_name = {x : 8-delete_list[i].x, y : delete_list[i].y};
		const new_color = delete_list[i].color;
		old.onclick = function() {choose(new_checker_name, this, new_color);}
		console.log(delete_list[i].color);
		checkers[delete_list[i].x - 1][delete_list[i].y] = new_color;
	}
	checkers[7-checker_name.x][checker_name.y] = 0;
	checker_name.x = 8-delete_list[0].x;
	checker_name.y = delete_list[0].y;
	const new_color = delete_list[0].color;
	const new_checker_name = {x : checker_name.x, y : checker_name.y};
	checker.onclick = function() {choose(new_checker_name, this, new_color);}
	checker.setAttribute("src", "../images/" + get_color(new_color) + ".png");
	delete_list = [];
	clear_styles("all");
	//global_list.splice(0, global_list.length - 1);
}

function chessboard_projection(name) {
	return String.fromCharCode(65 + name.y, 49 + name.x);
}