/**
 * 
 * @returns {Object}  {M: row count, N : col count, matrix: MxN matrix}
 */
function getInput() {
  const str = `${document.getElementById("input").value}`;
  console.log(input)
  const regex = /[*\d]+/gm;
  let m;
  const arr = []
  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    if (m[0] !== '*') arr.push(parseInt(m[0])); else arr.push(-1);
  }
  let M = arr.shift();
  let N = arr.shift();
  let matrix = [];
  let i = j = 0;
  for (let index = 0; index < M * N; index++) {
    if (j == N) {
      j = 0;
      i++;
    }
    if (j == 0) matrix.push([]);
    matrix[i].push(arr[index]);
    j++;
  }
  const encoding_method = document.getElementById("encoding_method").value
  return {
    M, N, matrix, encoding_method
  }
}

function createMatrix(M, N, arr) {
  const matrix = document.createElement("table");
  const table_body = document.createElement("tbody");
  matrix.appendChild(table_body);
  for (let row = 0; row < M; row++) {
    const t_row = document.createElement("tr");
    table_body.appendChild(t_row);
    for (let col = 0; col < N; col++) {
      const t_col = document.createElement("td");
      t_row.appendChild(t_col);

      const c_input = document.createElement("input");
      c_input.type = "number";
      c_input.classList.add("TABLE_CELL");
      c_input.value = arr[row][col] >= 0 ? arr[row][col] : '';
      t_col.appendChild(c_input);
    }
  }
  document.getElementById("matrix_input").innerHTML = "";
  document.getElementById("matrix_input").appendChild(matrix);
}
/**
 * Hiển thị kết quả
 * @param {number} M row count
 * @param {number} N column count
 * @param {number [][]} matrix_input 
 * @param {number []} matrix_edge_data 
 */
function renderResultMatrix(M, N, matrix_input, matrix_edge_data) {
  const matrix = document.createElement("table");
  const table_body = document.createElement("tbody");
  matrix.appendChild(table_body);
  for (let row = 0; row < M; row++) {
    const t_row = document.createElement("tr");
    table_body.appendChild(t_row);
    for (let col = 0; col < N; col++) {
      const t_col = document.createElement("td");
      t_row.appendChild(t_col);
      const c_input = document.createElement("input");
      c_input.disabled = true;
      c_input.classList.add("TABLE_CELL");
      if (matrix_edge_data.includes(convert_edge_to_index(row, col, M, N, 0))) c_input.classList.add("LEFT")
      if (matrix_edge_data.includes(convert_edge_to_index(row, col, M, N, 1))) c_input.classList.add("TOP")
      if (matrix_edge_data.includes(convert_edge_to_index(row, col, M, N, 2))) c_input.classList.add("RIGHT")
      if (matrix_edge_data.includes(convert_edge_to_index(row, col, M, N, 3))) c_input.classList.add("BOTTOM")
      c_input.value = matrix_input[row][col] >= 0 ? matrix_input[row][col] : '';
      t_col.appendChild(c_input);
    }
  }
  document.getElementById("matrix_output").innerHTML = "";
  document.getElementById("matrix_output").appendChild(matrix);
}

/**
 * Lấy chỉ số cạnh trên/dưới/phải/trái của ô có tọa độ (i,j)
 * @param {number} i row i
 * @param {number} j column j
 * @param {number} M row count
 * @param {number} N column count
 * @param {[0,3]} side LEFT = 0 /TOP = 1 /RIGHT = 2/BOTTOM = 3
 */
function convert_edge_to_index(i, j, M, N, side) {
  if (i < 0 || j < 0 || i + 1 > M || j + 1 > N) return null
  switch (side) {
    case 0:
      return M * i + j + 1
    case 1:
      return (M * N) + M * i + j + 1
    case 2:
      return (j + 1 < N) ? convert_edge_to_index(i, j + 1, M, N, 0) : (M * N) * 2 + i + 1
    case 3:
      return (i + 1 < M) ? convert_edge_to_index(i + 1, j, M, N, 1) : (M * N) * 2 + M + j + 1
  }
}

/**
 * Chuyển chỉ số thành cạnh trên/dưới/phải/trái của ô có tọa độ (i,j)
 * @param {number} M row count
 * @param {number} N col count 
 * @param {number} index
 * @returns {Object} 
 * {
 *  i : row i,
 *  j : col j,
 *  side: LEFT = 0 /TOP = 1 /RIGHT = 2/BOTTOM = 3
 * }
 */
function convert_index_to_edge(M, N, index) {
  index = index - 1;
  let i, j, side
  if (index < M * N) {
    side = 0;
    j = index % M;
    i = (index - j) / M
  }

  else if (index < 2 * M * N) {
    side = 1;
    index = index - (M * N)
    j = index % M;
    i = (index - j) / M;
  }
  else if (index < 2 * M * N + M) {
    side = 2;
    j = N - 1;
    i = index - (2 * M * N)
  }
  else {
    side = 3;
    i = M - 1;
    j = index - (2 * M * N + M)
  }
  return { i, j, side }
}

/**
 *
 * @param {string} data
 */
function SAT_output_to_array(data) {
  const vars = data.split(" ");
  if (vars[0] && vars[0] === "SAT") {
    vars.shift();

    return vars.reduce((arr, val) => {
      num = parseInt(val);
      if (num > 0) arr.push(num);
      return arr
    }, []);
  } else return [];
}

/**
 *
 * @param {string} data
 */
function showCNFPreview(data) {
  const preview = document.createElement("textarea");
  preview.innerHTML = data;
  document.getElementById("cnf_preview").innerHTML = "";
  document.getElementById("cnf_preview").appendChild(preview);
}

/**
 *
 * @param {string} data
 */
function showResult(data) {
  const result_preview = document.createElement("textarea");
  result_preview.innerText = data;
  document.getElementById("result").innerHTML = "";
  document.getElementById("result").appendChild(result_preview);
}

function showPerformanceInfo(time, clause_count, variable_count) {
  document.getElementById("time").innerText = "Thời gian chạy (ms):" + time;
  document.getElementById("clause_count").innerText = "Số mệnh đề:" + clause_count;
  document.getElementById("variable_count").innerText = "Số biến logic:" + variable_count;
}

/**
 *
 * @param {string} input
 * @returns
 */
function SAT_solve(input) {
  var solve_string = Module.cwrap("solve_string", "string", ["string", "int"]);
  var oldPrint = Module.print;
  var oldPrintErr = Module.printErr;
  var outputValue = "";
  var outputErr = "";
  var time;
  var result;
  Module["print"] = function (x) {
    outputValue += x + "\n";
  };
  Module["printErr"] = function (x) {
    outputErr += x + "\n";
  };
  try {
    var startTime = new Date().getTime();
    result = solve_string(input, input.length);
    var endTime = new Date().getTime();
    time = endTime - startTime;
  } catch (e) {
    Module.printErr("Error: " + e);
  }
  Module.print = oldPrint;
  Module.printErr = oldPrintErr;
  return { time, result, outputErr };
}