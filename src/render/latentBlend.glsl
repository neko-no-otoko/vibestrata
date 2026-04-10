// Prototype fragment shader for latent-like texture interpolation.
// Intended as a portable conceptual reference before Metal/Vulkan ports.

#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_prevScene;
uniform sampler2D u_nextScene;
uniform sampler2D u_noise;
uniform float u_t; // [0,1]
uniform float u_distortionStrength;

varying vec2 v_uv;

void main() {
  vec2 noiseUv = v_uv * 1.5 + vec2(u_t * 0.2, -u_t * 0.15);
  vec2 warp = (texture2D(u_noise, noiseUv).rg - 0.5) * u_distortionStrength;

  vec4 fromColor = texture2D(u_prevScene, v_uv + warp * (1.0 - u_t));
  vec4 toColor = texture2D(u_nextScene, v_uv - warp * u_t);

  // Smooth melt curve to avoid abrupt transitions near endpoints.
  float k = smoothstep(0.0, 1.0, u_t);
  gl_FragColor = mix(fromColor, toColor, k);
}
