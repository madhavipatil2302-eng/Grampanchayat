
import { BASE_URL } from './apiConfig'

export const UserAI = async (qun, schemes = [], ongoingProjects = [], emptyVillageStatistics = null) => {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 35000)

  try {
    const data = { qun, schemes, ongoingProjects, emptyVillageStatistics }

    const response = await fetch(`${BASE_URL}/api/user-ai`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal: controller.signal,
    })

    const result = await response.json().catch(() => ({}))

    if (!response.ok || result?.success === false) {
      return {
        success: false,
        data: null,
        message: result?.message || result?.error || 'Unable to generate response.',
      }
    }

    return result
  } catch (error) {
    console.log(error)

    return {
      success: false,
      data: null,
      message: error?.name === 'AbortError'
        ? 'AI could not respond quickly. Please try again.'
        : 'Unable to connect backend server.',
    }
  } finally {
    window.clearTimeout(timeoutId)
  }
}
