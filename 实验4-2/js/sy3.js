const canvas = document.getElementById('glCanvas');
        const gl = canvas.getContext('webgl');

        if (!gl) {
            console.error('WebGL not supported');
        }

        // Vertex shader program
        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            varying lowp vec4 vColor;
            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vColor = aVertexColor;
            }
        `;

        // Fragment shader program
        const fsSource = `
            varying lowp vec4 vColor;
            void main(void) {
                gl_FragColor = vColor;
            }
        `;

        // Initialize a shader program
        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

        // Collect shader program info
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            },
        };

        // Set up buffers
        const buffers = initBuffers(gl);

        // Draw the scene
        function render() {
            drawScene(gl, programInfo, buffers);
        }

        // Handle slider input
        document.getElementById('scaleSlider').addEventListener('input', render);
        document.getElementById('rotateXSlider').addEventListener('input', render);
        document.getElementById('rotateYSlider').addEventListener('input', render);
		document.getElementById('rotateZSlider').addEventListener('input', render);
        render();

        function initShaderProgram(gl, vsSource, fsSource) {
            const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
            const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

            const shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
                return null;
            }
            return shaderProgram;
        }

        function loadShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        function initBuffers(gl) {
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

            const positions = [
                -0.5, -0.5,  0.5,
                 0.5, -0.5,  0.5,
                 0.5,  0.5,  0.5,
                -0.5,  0.5,  0.5,
                -0.5, -0.5, -0.5,
                 0.5, -0.5, -0.5,
                 0.5,  0.5, -0.5,
                -0.5,  0.5, -0.5,
            ];

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

            const colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

            const faceColors = [
                [0.0, 0.0, 0.0, 1.0],
                [1.0, 0.0, 0.0, 1.0],
                [1.0, 1.0, 0.0, 1.0],
                [0.0, 1.0, 0.0, 1.0], 
                [0.0, 0.0, 1.0, 1.0],
                [1.0, 0.0, 1.0, 1.0],
                [1.0, 1.0, 1.0, 1.0],
                [0.0, 1.0, 1.0, 1.0],
            ];

            let colors = [];

            for (const color of faceColors) {
                colors = colors.concat(color);
            }

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

            const indices = [
                0, 1, 2,  0, 2, 3,  // front
                4, 5, 6,  4, 6, 7,  // back
                3, 2, 6,  3, 6, 7,  // top
                4, 5, 1,  4, 1, 0,  // bottom
                1, 5, 6,  1, 6, 2,  // right
                4, 0, 3,  4, 3, 7,  // left
            ];

            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

            return {
                position: positionBuffer,
                color: colorBuffer,
                indices: indexBuffer,
            };
        }

        function drawScene(gl, programInfo, buffers) {
            gl.clearColor(1.0, 1.0, 1.0, 1.0);
            gl.clearDepth(1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            const fieldOfView = 45 * Math.PI / 180;
            const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            const zNear = 0.1;
            const zFar = 100.0;
            const projectionMatrix = mat4.create();

            mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

            const modelViewMatrix = mat4.create();
            const scale = parseFloat(document.getElementById('scaleSlider').value);
            mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);
            mat4.scale(modelViewMatrix, modelViewMatrix, [scale, scale, scale]);
            mat4.rotate(modelViewMatrix, modelViewMatrix, parseFloat(document.getElementById('rotateXSlider').value) * Math.PI / 180, [1, 0, 0]);
            mat4.rotate(modelViewMatrix, modelViewMatrix, parseFloat(document.getElementById('rotateYSlider').value) * Math.PI / 180, [0, 1, 0]);
			mat4.rotate(modelViewMatrix, modelViewMatrix, parseFloat(document.getElementById('rotateZSlider').value) * Math.PI / 180, [0, 0, 1]);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                3,
                gl.FLOAT,
                false,
                0,
                0
            );
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexColor,
                4,
                gl.FLOAT,
                false,
                0,
                0
            );
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

            gl.useProgram(programInfo.program);

            gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
            gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

            const vertexCount = 36;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }