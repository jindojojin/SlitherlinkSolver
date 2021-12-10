function get_slither_cnf(M, N, input_matrix, encoding_method = "binomial") {
    let cnf_formular = '';
    let have_rule_check = [];
    var start_S_value = 2 * M * N + M + N
    var clause_count = 0;
    function exactly(vars, k, condition) {
        let result;
        if (k === 1 && encoding_method === "sequential") {
            result = exactlyOneSequential(vars, condition, start_S_value);
            start_S_value += vars.length;
        } else {
            result = exactlyBinomial(vars, k, condition)
        }
        clause_count += result.clause_count;
        return result.cnf;
    }
    for (let i = 0; i < M; i++) {
        for (let j = 0; j < N; j++) {
            // Số cạnh được tô xung quanh 1 ô = giá trị của ô đÓ
            const vars = [0, 1, 2, 3].map(side => convert_edge_to_index(i, j, M, N, side)).filter(e => e) // loại bỏ các giá trị null;
            cnf_formular += input_matrix[i][j] >= 0 ? exactly(vars, input_matrix[i][j], true) : atMostBinomial(vars, 4, true).cnf

            // Nếu 1 cạnh được tô, mỗi đầu sẽ liên kết với chính xác 1 cạnh được tô khác
            for (let index = 0; index < 4; index++) {
                const edge_index = vars[index];
                if (!have_rule_check[edge_index]) {
                    const { group1, group2 } = getAdjacentEdgesOfEdges(edge_index, M, N)
                    let encode1 = exactly(group1, 1, true);
                    let encode2 = exactly(group2, 1, true);
                    cnf_formular += `${encode1}${encode2}`.split('\n').filter(e => e.length).map(line => `${-edge_index} ${line}\n`).join('')
                    have_rule_check[edge_index] = true;
                }
            }
        }
    }

    return {
        cnf: cnf_formular,
        clause_count: clause_count,
        variable_count: start_S_value
    };
}

function checkOneLoop(M, N, edge_list) {
    const SelectedEdge = edge_list.filter(e => e > 0);
    // console.log("Check loop for:", SelectedEdge)
    const VisitedEdge = [];
    let current_edge = SelectedEdge[0];
    VisitedEdge[current_edge] = true;
    let edge_count = SelectedEdge.length - 1;
    let has_next = true;
    while (has_next) {
        const neighbor = getAdjacentEdgesOfEdges(current_edge, M, N);
        let neighbor_edges = [...neighbor.group1, ...neighbor.group2];
        has_next = false;
        for (let index = 0; index < neighbor_edges.length; index++) {
            const edge = neighbor_edges[index];
            if (SelectedEdge.includes(edge) && !VisitedEdge[edge]) {
                current_edge = edge;
                VisitedEdge[edge] = true;
                edge_count--;
                has_next = true;
                break;
            }
        }
    }
    console.log(edge_count);
    return edge_count === 0;
}

function getAdjacentEdgesOfEdges(index, M, N) {
    const { i, j, side } = convert_index_to_edge(M, N, index);
    let top_edge = top_left_edge = top_right_edge = bottom_edge = bottom_left_edge = bottom_right_edge = left_edge = right_edge = null
    if (side === 0) { // cạnh trái của ô i,j
        top_edge = convert_edge_to_index(i - 1, j, M, N, 0) // cạnh trái của ô bên trên
        top_left_edge = convert_edge_to_index(i, j - 1, M, N, 1) // cạnh trên của ô bên trái
        top_right_edge = convert_edge_to_index(i, j, M, N, 1) // cạnh trên của ô i,j
        bottom_edge = convert_edge_to_index(i + 1, j, M, N, 0) // cạnh trái của ô bên dưới
        bottom_left_edge = convert_edge_to_index(i, j - 1, M, N, 3) // cạnh dưới của ô bên trái
        bottom_right_edge = convert_edge_to_index(i, j, M, N, 3) // cạnh dưới của ô i,j
    }

    if (side === 1) { // cạnh trên của ô i,j
        left_edge = convert_edge_to_index(i, j - 1, M, N, 1) // cạnh trên của ô bên trái
        top_left_edge = convert_edge_to_index(i - 1, j, M, N, 0) // cạnh trái của ô bên trên
        bottom_left_edge = convert_edge_to_index(i, j, M, N, 0) // cạnh trái của ô i,j
        right_edge = convert_edge_to_index(i, j + 1, M, N, 1) // cạnh trên của ô bên phải
        top_right_edge = convert_edge_to_index(i - 1, j, M, N, 2) // cạnh phải của ô bên trên
        bottom_right_edge = convert_edge_to_index(i, j, M, N, 2) // cạnh phải của ô i,j
    }

    if (side == 2) { // cạnh phải của ô i,j ( j luôn bằng N)
        top_left_edge = convert_edge_to_index(i, j, M, N, 1) // cạnh trên của ô i,j
        bottom_left_edge = convert_edge_to_index(i, j, M, N, 3) // cạnh dưới của ô i,j
        top_edge = convert_edge_to_index(i - 1, j, M, N, 2) // cạnh phải của ô bên trên
        bottom_edge = convert_edge_to_index(i + 1, j, M, N, 2) // cạnh phải của ô bên dưới
    }

    if (side == 3) { // cạnh dưới của ô i,j ( i luôn bằng M)
        top_left_edge = convert_edge_to_index(i, j, M, N, 0) // cạnh trái của ô i,j
        top_right_edge = convert_edge_to_index(i, j, M, N, 2) // cạnh phải của ô i,j
        left_edge = convert_edge_to_index(i, j - 1, M, N, 3) // cạnh dướ của ô bên trái
        right_edge = convert_edge_to_index(i, j + 1, M, N, 3) // cạnh dưới của ô bên phải
    }

    let group1 = side % 2 == 0 ? [top_left_edge, top_edge, top_right_edge] : [bottom_left_edge, left_edge, top_left_edge];
    let group2 = side % 2 == 0 ? [bottom_left_edge, bottom_edge, bottom_right_edge] : [bottom_right_edge, right_edge, top_right_edge];
    return {
        group1: group1.filter(e => e), // loại bỏ giá trị null
        group2: group2.filter(e => e)
    }
}