/**
 * Implementação do Filtro de Kalman para reduzir ruído em medições
 *
 * O filtro de Kalman é um algoritmo recursivo que estima o estado de um sistema dinâmico
 * a partir de medições ruidosas. É particularmente útil para suavizar dados de sensores.
 */
class KalmanFilter {
  private x: number
  private p: number
  private q: number
  private r: number
  private k: number

  /**
   * Inicializa o filtro de Kalman
   * @param initialValue Valor inicial estimado
   * @param initialCovariance Covariância inicial do erro estimado
   * @param processNoise Covariância do ruído do processo (quanto maior, mais rápido o filtro responde a mudanças)
   * @param measurementNoise Covariância do ruído da medição (quanto maior, mais suavização)
   */
  constructor(initialValue = 0, initialCovariance = 1, processNoise = 0.01, measurementNoise = 0.1) {
    this.x = initialValue
    this.p = initialCovariance
    this.q = processNoise
    this.r = measurementNoise
    this.k = 0
  }

  /**
   * Atualiza o filtro com uma nova medição
   * @param measurement Nova medição
   * @returns Valor filtrado
   */
  update(measurement: number): number {
    // Predição
    this.p = this.p + this.q

    // Atualização
    this.k = this.p / (this.p + this.r)
    this.x = this.x + this.k * (measurement - this.x)
    this.p = (1 - this.k) * this.p

    return this.x
  }

  /**
   * Reinicia o filtro com novos valores
   * @param initialValue Valor inicial estimado
   * @param initialCovariance Covariância inicial do erro estimado
   */
  reset(initialValue = 0, initialCovariance = 1): void {
    this.x = initialValue
    this.p = initialCovariance
    this.k = 0
  }
}

// Instância do filtro de Kalman para a frequência cardíaca
const heartRateFilter = new KalmanFilter(70, 4, 0.08, 2)

/**
 * Aplica o filtro de Kalman a uma medição de frequência cardíaca
 * @param heartRate Medição da frequência cardíaca
 * @returns Valor filtrado da frequência cardíaca
 */
export const filterHeartRate = (rawHeartRate: number): number => {
  // Implementação existente do filtro de Kalman
  const filteredValue = heartRateFilter.update(rawHeartRate)

  // Limitar valores extremos (para evitar valores irreais como 600 bpm)
  if (filteredValue > 220) return 220
  if (filteredValue < 40) return 40

  // Arredondar para uma casa decimal
  return Math.round(filteredValue * 10) / 10
}

/**
 * Verifica o status da frequência cardíaca com base em limites predefinidos
 * @param heartRate Frequência cardíaca
 * @returns Objeto com o status e severidade
 */
export const checkHeartRateStatus = (heartRate: number): { status: string; severity: string } => {
  if (heartRate > 120) {
    return { status: "critical", severity: "critical" }
  } else if (heartRate > 100) {
    return { status: "high", severity: "warning" }
  } else {
    return { status: "normal", severity: "info" }
  }
}
