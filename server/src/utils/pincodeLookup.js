const axios = require('axios')

/**
 * Look up pincode details from India Post API
 * Returns: { state, district, city, taluk } or null on failure
 */
async function lookupPincode(pincode) {
  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    return null
  }

  try {
    // India Post free API — no key required
    const { data } = await axios.get(
      `https://api.postalpincode.in/pincode/${pincode}`,
      { timeout: 5000 }
    )

    if (
      data &&
      data[0]?.Status === 'Success' &&
      data[0]?.PostOffice?.length > 0
    ) {
      const po = data[0].PostOffice[0]
      return {
        state:    po.State    || '',
        district: po.District || '',
        city:     po.Name     || '',
        taluk:    po.Taluk    || '',
        region:   po.Region   || '',
        country:  'India',
      }
    }

    return null
  } catch (err) {
    console.error('[Pincode Lookup Error]', err.message)
    // Fall back to bundled common pincodes
    return fallbackLookup(pincode)
  }
}

/**
 * Bundled fallback for common pincodes
 * Add more as needed
 */
const PINCODE_FALLBACK = {
  // Punjab
  '144401': { state: 'Punjab',      district: 'Kapurthala', city: 'Phagwara'       },
  '144402': { state: 'Punjab',      district: 'Kapurthala', city: 'Phagwara'       },
  '141001': { state: 'Punjab',      district: 'Ludhiana',   city: 'Ludhiana'       },
  '141003': { state: 'Punjab',      district: 'Ludhiana',   city: 'Ludhiana West'  },
  '160001': { state: 'Chandigarh',  district: 'Chandigarh', city: 'Chandigarh'     },
  // Bihar
  '800001': { state: 'Bihar',       district: 'Patna',      city: 'Patna'          },
  '801505': { state: 'Bihar',       district: 'Patna',      city: 'Phulwari Sharif'},
  // Delhi
  '110001': { state: 'Delhi',       district: 'Central Delhi', city: 'New Delhi'   },
  '110011': { state: 'Delhi',       district: 'South Delhi',   city: 'Sarojini Nagar'},
  // Maharashtra
  '400001': { state: 'Maharashtra', district: 'Mumbai',     city: 'Fort'           },
  '411001': { state: 'Maharashtra', district: 'Pune',       city: 'Pune'           },
  // UP
  '226001': { state: 'Uttar Pradesh', district: 'Lucknow', city: 'Lucknow'        },
  '208001': { state: 'Uttar Pradesh', district: 'Kanpur',  city: 'Kanpur'         },
  // Gujarat
  '380001': { state: 'Gujarat',     district: 'Ahmedabad',  city: 'Ahmedabad'      },
  // Rajasthan
  '302001': { state: 'Rajasthan',   district: 'Jaipur',     city: 'Jaipur'         },
  // Karnataka
  '560001': { state: 'Karnataka',   district: 'Bengaluru',  city: 'Bengaluru'      },
  // Tamil Nadu
  '600001': { state: 'Tamil Nadu',  district: 'Chennai',    city: 'Chennai'        },
}

function fallbackLookup(pincode) {
  return PINCODE_FALLBACK[pincode] || null
}

module.exports = { lookupPincode }
