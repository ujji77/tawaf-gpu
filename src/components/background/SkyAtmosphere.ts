import {
  BackSide,
  BoxGeometry,
  Mesh,
  Vector3,
  NodeMaterial,
} from 'three/webgpu';
import {
  Fn,
  If,
  float,
  vec2,
  vec3,
  vec4,
  acos,
  add,
  mul,
  clamp,
  cos,
  dot,
  exp,
  max,
  mix,
  modelViewProjection,
  normalize,
  positionWorld,
  pow,
  smoothstep,
  sub,
  varyingProperty,
  uniform,
  cameraPosition,
  floor,
  fract,
  sin,
} from 'three/tsl';

function hash2(p: ReturnType<typeof vec2>) {
  return fract(sin(dot(p, vec2(127.1, 311.7))).mul(43758.5453123));
}

function noise2(p: ReturnType<typeof vec2>) {
  const i = floor(p);
  const f = fract(p);
  const u = f.mul(f).mul(float(3.0).sub(f.mul(2.0)));
  const a = hash2(i);
  const b = hash2(i.add(vec2(1.0, 0.0)));
  const c = hash2(i.add(vec2(0.0, 1.0)));
  const d = hash2(i.add(vec2(1.0, 1.0)));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

function fbm(p: ReturnType<typeof vec2>) {
  return noise2(p)
    .mul(0.5)
    .add(noise2(p.mul(2.0)).mul(0.25))
    .add(noise2(p.mul(4.0)).mul(0.125))
    .add(noise2(p.mul(8.0)).mul(0.0625))
    .add(noise2(p.mul(16.0)).mul(0.03125));
}

/** WebGPU Preetham sky with the official example's cloud layer. */
export class SkyAtmosphere extends Mesh {
  turbidity = uniform(1.8);
  rayleigh = uniform(1.787);
  mieCoefficient = uniform(0.002);
  mieDirectionalG = uniform(0.631);
  sunPosition = uniform(new Vector3());
  upUniform = uniform(new Vector3(0, 1, 0));
  cloudScale = uniform(0.0002);
  cloudSpeed = uniform(0.0001);
  cloudCoverage = uniform(0.27);
  cloudDensity = uniform(0.77);
  cloudElevation = uniform(0.5);
  showSunDisc = uniform(1);
  time = uniform(0);

  constructor() {
    const material = new NodeMaterial();
    super(new BoxGeometry(1, 1, 1), material);

    const vSunDirection = varyingProperty('vec3');
    const vSunE = varyingProperty('float');
    const vSunfade = varyingProperty('float');
    const vBetaR = varyingProperty('vec3');
    const vBetaM = varyingProperty('vec3');

    const vertexNode = Fn(() => {
      const e = float(2.71828182845904523536028747135266249775724709369995957);
      const totalRayleigh = vec3(5.804542996261093e-6, 1.3562911419845635e-5, 3.0265902468824876e-5);
      const MieConst = vec3(1.8399918514433978e14, 2.7798023919660528e14, 4.0790479543861094e14);
      const cutoffAngle = float(1.6110731556870734);
      const steepness = float(1.5);
      const EE = float(1000.0);

      const sunDirection = normalize(this.sunPosition);
      vSunDirection.assign(sunDirection);

      const angle = dot(sunDirection, this.upUniform);
      const zenithAngleCos = clamp(angle, -1, 1);
      const sunIntensity = EE.mul(
        max(0.0, float(1.0).sub(pow(e, cutoffAngle.sub(acos(zenithAngleCos)).div(steepness).negate())))
      );
      vSunE.assign(sunIntensity);

      const sunfade = float(1.0).sub(clamp(float(1.0).sub(exp(this.sunPosition.y.div(450000.0))), 0, 1));
      vSunfade.assign(sunfade);

      const rayleighCoefficient = this.rayleigh.sub(float(1.0).mul(float(1.0).sub(sunfade)));
      vBetaR.assign(totalRayleigh.mul(rayleighCoefficient));

      const c = float(0.2).mul(this.turbidity).mul(10e-18);
      const totalMie = float(0.434).mul(c).mul(MieConst);
      vBetaM.assign(totalMie.mul(this.mieCoefficient));

      const position = modelViewProjection;
      position.z.assign(position.w);
      return position;
    })();

    const colorNode = Fn(() => {
      const pi = float(3.141592653589793238462643383279502884197169);
      const rayleighZenithLength = float(8.4e3);
      const mieZenithLength = float(1.25e3);
      const sunAngularDiameterCos = float(0.999956676946448443553574619906976478926848692873900859324);
      const THREE_OVER_SIXTEENPI = float(0.05968310365946075);
      const ONE_OVER_FOURPI = float(0.07957747154594767);

      const direction = normalize(positionWorld.sub(cameraPosition));

      const zenithAngle = acos(max(0.0, dot(this.upUniform, direction)));
      const inverse = float(1.0).div(
        cos(zenithAngle).add(float(0.15).mul(pow(float(93.885).sub(zenithAngle.mul(180.0).div(pi)), -1.253)))
      );
      const sR = rayleighZenithLength.mul(inverse);
      const sM = mieZenithLength.mul(inverse);

      const Fex = exp(mul(vBetaR, sR).add(mul(vBetaM, sM)).negate());
      const cosTheta = dot(direction, vSunDirection);

      const c = cosTheta.mul(0.5).add(0.5);
      const rPhase = THREE_OVER_SIXTEENPI.mul(float(1.0).add(pow(c, 2.0)));
      const betaRTheta = vBetaR.mul(rPhase);

      const g2 = pow(this.mieDirectionalG, 2.0);
      const inv = float(1.0).div(
        pow(float(1.0).sub(float(2.0).mul(this.mieDirectionalG).mul(cosTheta)).add(g2), 1.5)
      );
      const mPhase = ONE_OVER_FOURPI.mul(float(1.0).sub(g2)).mul(inv);
      const betaMTheta = vBetaM.mul(mPhase);

      const Lin = pow(
        vSunE.mul(add(betaRTheta, betaMTheta).div(add(vBetaR, vBetaM))).mul(sub(1.0, Fex)),
        vec3(1.5)
      ).toVar();
      Lin.mulAssign(
        mix(
          vec3(1.0),
          pow(
            vSunE.mul(add(betaRTheta, betaMTheta).div(add(vBetaR, vBetaM))).mul(Fex),
            vec3(1.0 / 2.0)
          ),
          clamp(pow(sub(1.0, dot(this.upUniform, vSunDirection)), 5.0), 0.0, 1.0)
        )
      );

      const L0 = vec3(0.1).mul(Fex).toVar();
      const sundisk = smoothstep(sunAngularDiameterCos, sunAngularDiameterCos.add(0.00002), cosTheta).mul(
        this.showSunDisc
      );
      L0.addAssign(vSunE.mul(19000.0).mul(Fex).mul(sundisk));

      const texColor = add(Lin, L0).mul(0.04).add(vec3(0.0, 0.0003, 0.00075)).toVar();

      If(direction.y.greaterThan(0.0).and(this.cloudCoverage.greaterThan(0.0)), () => {
        const elevation = mix(float(1.0), float(0.1), this.cloudElevation);
        const cloudUV = direction.xz
          .div(direction.y.mul(elevation))
          .mul(this.cloudScale)
          .add(this.time.mul(this.cloudSpeed));

        const cloudNoise = fbm(cloudUV.mul(1000.0))
          .add(float(0.5).mul(fbm(cloudUV.mul(2000.0).add(3.7))))
          .mul(0.5)
          .add(0.5);

        const cloudMask = smoothstep(
          float(1.0).sub(this.cloudCoverage),
          float(1.0).sub(this.cloudCoverage).add(0.3),
          cloudNoise
        ).mul(smoothstep(float(0.0), float(0.1).add(this.cloudElevation.mul(0.2)), direction.y));

        const sunInfluence = dot(direction, vSunDirection).mul(0.5).add(0.5);
        const daylight = max(0.0, vSunDirection.y.mul(2.0));

        const atmosphereColor = Lin.mul(0.04);
        const cloudColor = mix(vec3(0.3), vec3(1.0), daylight)
          .toVar();
        cloudColor.assign(mix(cloudColor, atmosphereColor.add(vec3(1.0)), sunInfluence.mul(0.5)));
        cloudColor.mulAssign(vSunE.mul(0.00002));

        texColor.assign(mix(texColor, cloudColor, cloudMask.mul(this.cloudDensity)));
      });

      const retColor = pow(texColor, vec3(float(1.0).div(float(1.2).add(vSunfade.mul(1.2)))));
      return vec4(retColor, 1.0);
    })();

    material.side = BackSide;
    material.depthWrite = false;
    material.vertexNode = vertexNode;
    material.colorNode = colorNode;
  }
}
