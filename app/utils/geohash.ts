// Geohash decoding utility
// This function converts a geohash string to a bounding box

const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz"

export function decodeGeohash(geohash: string) {
  let isEven = true
  const lat = [-90, 90]
  const lng = [-180, 180]

  for (let i = 0; i < geohash.length; i++) {
    const c = geohash[i]
    const cd = BASE32.indexOf(c)

    for (let j = 4; j >= 0; j--) {
      const mask = 1 << j
      if (isEven) {
        // longitude
        const mid = (lng[0] + lng[1]) / 2
        if ((cd & mask) > 0) {
          lng[0] = mid
        } else {
          lng[1] = mid
        }
      } else {
        // latitude
        const mid = (lat[0] + lat[1]) / 2
        if ((cd & mask) > 0) {
          lat[0] = mid
        } else {
          lat[1] = mid
        }
      }
      isEven = !isEven
    }
  }

  return {
    minLat: lat[0],
    maxLat: lat[1],
    minLng: lng[0],
    maxLng: lng[1],
  }
}
