const canvas = document.querySelector("#c");
const gl = canvas.getContext("webgl");

const vertexShaderSource = `
    // 一个属性变量，将会从缓冲中获取数据
    attribute vec4 a_position;

    // 所有着色器都有一个main方法
    void main() {
        // gl_Position 是一个顶点着色器主要设置的变量
        gl_Position = a_position;
    }
`;
const fragmentShaderSource = `
    // 片段着色器没有默认精度，所以我们需要设置一个精度
    // mediump是一个不错的默认值，代表“medium precision”（中等精度）
    precision mediump float;

    void main() {
        // gl_FragColor是一个片段着色器主要设置的变量
        gl_FragColor = vec4(1, 0, 0.5, 1); // 返回“瑞迪施紫色”
    }
`;

// #region 初始化渲染
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = createProgram(gl, vertexShader, fragmentShader);
// 传值进去
const positionAttributeLocation = gl.getAttribLocation(program, "a_position"); // 找到变量位置
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // 将 positionBuffer 绑定到 gl.ARRAY_BUFFER 上下文目标中。

// 三个二维点坐标
const positions = [0, 0, 0, 0.5, 0.7, 0];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW); // gl.STATIC_DRAW 优化，告诉 webgl 不会经常改变这些数据
/**
 * 如果存在多个变量需要赋值 就需要分步赋值
    / 指定顶点坐标数据
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // 指定顶点颜色数据
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorAttributeLocation);
 */

// #endregion 初始化渲染

// #region 渲染
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
// 清空画布，使其透明
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);
// 告诉用的着色器程序
gl.useProgram(program);

// 启动对应属性
gl.enableVertexAttribArray(positionAttributeLocation);

// 告诉属性这么从 positionBuffer 中读数据 (ARRAY_BUFFER)
const size = 2; // 每次迭代提取两个单位数据
const type = gl.FLOAT; // 每个单位数据是 32 浮点
const normalize = false; // 不需要归一化数据
const stride = 0; // 0 = 移动单位数量 * 每个单位占用内存 sizeof(type)

const offset = 0; // 从缓存哪个位置开始读取

// 告诉 webgl 如何从绑定的缓冲区对象获取顶点数据
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

// 开始绘制
const primitiveType = gl.TRIANGLES;
const count = 3; // 运行三次
gl.drawArrays(primitiveType, offset, count);

// #endregion 渲染

function createShader(gl, type, source) {
  const shader = gl.createShader(type); // 创建着色器对象
  gl.shaderSource(shader, source); // 提供数据源
  gl.compileShader(shader); // 编译数据源
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram(); // 着色程序
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program); //
  return program;
}
