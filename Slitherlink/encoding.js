function atMostBinomial(vars, k, condition = true) {
    return atLeastBinomial(vars, vars.length - k, !condition);
}

function atLeastBinomial(vars, k, condition = true) {
    let at_least_encoding = "";
    const Combination = combination_generator(vars.length - k + 1, vars.length);
    Combination.forEach((com) => {
        com.forEach((index) => {
            at_least_encoding += `${condition ? vars[index] : -vars[index]} `;
        });
        at_least_encoding += `0\n`;
    });
    return {
        cnf: at_least_encoding, clause_count: Combination.length
    };
}
function atMostOneSequential(vars, condition = true, current_S_value) {  // encodeing sequential
    const sign = condition ? 1 : -1;
    let at_most_encoding = `${-vars[0] * sign} ${current_S_value * sign} 0\n`;  // X0-> S0
    current_S_value += 1; // nhảy biến phụ S tiếp theo
    let clause_count = 2;
    for (let i = 1; i < vars.length - 1; i++) { //   (Xi V Si-1) -> Si ^ (Si-1 -> -Xi)  ===  (-Xi V Si) ^  ( - Si-1 V Xi ) ^  (- Si-1 V Si)
        at_most_encoding += `${-vars[i] * sign} ${current_S_value * sign} 0\n`  // (-Xi V Si)
        at_most_encoding += `${-(current_S_value - 1) * sign} ${-vars[i] * sign} 0\n` // ( - Si-1 V -Xi)
        at_most_encoding += `${-(current_S_value - 1) * sign} ${current_S_value * sign} 0\n` // ( - Si-1  V Si)
        current_S_value += 1;
        clause_count += 3;
    }
    at_most_encoding += `${-(current_S_value)} ${-vars[vars.length - 1]} 0\n` //Sn-1 -> -Xn
    current_S_value += 1;
    return {
        cnf: at_most_encoding,
        clause_count
    };
}

function exactlyBinomial(vars, k, condition = true) {
    const atLeast = atLeastBinomial(vars, k, condition);
    const atMost = atMostBinomial(vars, k, condition);
    return {
        cnf: `${atLeast.cnf}${atMost.cnf}`,
        clause_count: atLeast.clause_count + atMost.clause_count
    };
}

function exactlyOneSequential(vars, condition = true, start_S_value) {
    const atLeast = atLeastBinomial(vars, 1, condition);
    const atMost = atMostOneSequential(vars, condition, start_S_value);
    return {
        cnf: `${atLeast.cnf}${atMost.cnf}`,
        clause_count: atLeast.clause_count + atMost.clause_count
    };
}


const memo = []
/**
 * Sinh tổ hợp chập k của n
 * @param {number} k
 * @param {number} n
 */
function combination_generator(k, n) {
    if (memo[k] && memo[k][n]) return memo[k][n]
    const result = [];
    const used = [];
    const temp = [];
    function backtrack(i) {
        if (i == k) {
            result.push([...temp]);
            return;
        }
        for (let j = 0; j < n; j++) {
            if (!used[j]) {
                if (i > 0 && j < temp[i - 1]) continue;
                temp[i] = j;
                used[j] = true;
                backtrack(i + 1);
                used[j] = false;
            }
        }
    }
    backtrack(0);
    if (!memo[k]) memo[k] = [];
    memo[k][n] = result;
    return result;
}
