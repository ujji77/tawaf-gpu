type EventEnv = {
  AE?: {
    writeDataPoint: (point: {
      blobs?: string[];
      doubles?: number[];
      indexes?: string[];
    }) => void;
  };
}

const ALLOWED = new Set(['start', 'hotspot', 'screenshot', 'restart'])

export async function onRequestPost(context: { request: Request; env: EventEnv }) {
  const { request, env } = context

  let event = 'unknown'
  let extra = ''
  try {
    const body = JSON.parse(await request.text()) as { name?: string; extra?: string }
    if (typeof body.name === 'string' && ALLOWED.has(body.name)) {
      event = body.name
    }
    if (typeof body.extra === 'string') {
      extra = body.extra.slice(0, 64)
    }
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  const country = request.headers.get('cf-ipcountry') ?? ''
  env.AE?.writeDataPoint({
    blobs: [event, extra, country],
    doubles: [1],
    indexes: [event],
  })

  return new Response(null, { status: 204 })
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
