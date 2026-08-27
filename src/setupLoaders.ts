import { useGLTF } from '@react-three/drei'

// Kaaba + pilgrim GLBs require Draco. Point at our copy so CSP does not need gstatic.
useGLTF.setDecoderPath(`${import.meta.env.BASE_URL}draco/`)
