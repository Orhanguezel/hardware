'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { 
  Zap, 
  Shield, 
  Wifi, 
  Settings,
  DollarSign,
  Gamepad2,
  Home,
  Briefcase
} from 'lucide-react'

interface Criteria {
  id: string
  name: string
  weight: number
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description: string
}

interface RatingEngineProps {
  onScoreChange?: (totalScore: number, breakdown: Record<string, number>) => void
  initialScores?: Record<string, number>
  profile?: 'general' | 'gaming' | 'home' | 'business'
}

const criteria: Criteria[] = [
  {
    id: 'performance',
    name: 'Performans',
    weight: 0.35,
    icon: Zap,
    description: 'Genel hız ve verimlilik'
  },
  {
    id: 'stability',
    name: 'İstikrar & Ping',
    weight: 0.25,
    icon: Shield,
    description: 'Bağlantı güvenilirliği ve gecikme'
  },
  {
    id: 'coverage',
    name: 'Kapsama & Çekim',
    weight: 0.20,
    icon: Wifi,
    description: 'Sinyal gücü ve kapsama alanı'
  },
  {
    id: 'software',
    name: 'Yazılım & Arayüz',
    weight: 0.10,
    icon: Settings,
    description: 'Kullanıcı arayüzü ve özellikler'
  },
  {
    id: 'value',
    name: 'Fiyat & Değer',
    weight: 0.10,
    icon: DollarSign,
    description: 'Fiyat/performans oranı'
  }
]

const profiles = {
  general: {
    name: 'Genel Kullanım',
    icon: Home,
    adjustments: {}
  },
  gaming: {
    name: 'Oyun Profili',
    icon: Gamepad2,
    adjustments: {
      stability: 0.40,
      performance: 0.30,
      coverage: 0.15,
      software: 0.10,
      value: 0.05
    }
  },
  home: {
    name: 'Ev Kullanımı',
    icon: Home,
    adjustments: {
      coverage: 0.35,
      performance: 0.25,
      stability: 0.20,
      value: 0.15,
      software: 0.05
    }
  },
  business: {
    name: 'İş Profili',
    icon: Briefcase,
    adjustments: {
      stability: 0.40,
      software: 0.25,
      performance: 0.20,
      coverage: 0.10,
      value: 0.05
    }
  }
}

export default function RatingEngine({ onScoreChange, initialScores, profile = 'general' }: RatingEngineProps) {
  const [scores, setScores] = useState<Record<string, number>>(
    initialScores || {
      performance: 5,
      stability: 5,
      coverage: 5,
      software: 5,
      value: 5
    }
  )
  const [currentProfile, setCurrentProfile] = useState(profile)
  const [totalScore, setTotalScore] = useState(0)

  const calculateScore = useCallback((scores: Record<string, number>, profileType: string) => {
    const profileWeights = profiles[profileType as keyof typeof profiles]?.adjustments || {}
    
    let weightedSum = 0
    let totalWeight = 0
    
    criteria.forEach(criterion => {
      const weight = (profileWeights as Record<string, number>)[criterion.id] || criterion.weight
      weightedSum += scores[criterion.id] * weight
      totalWeight += weight
    })
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0
  }, [])

  useEffect(() => {
    const newScore = calculateScore(scores, currentProfile)
    setTotalScore(newScore)
    
    const breakdown = Object.keys(scores).reduce((acc, key) => {
      acc[key] = scores[key]
      return acc
    }, {} as Record<string, number>)
    
    onScoreChange?.(newScore, breakdown)
  }, [scores, currentProfile, calculateScore]) // calculateScore bağımlılığını ekledik

  const updateScore = (criterionId: string, value: number) => {
    setScores(prev => ({
      ...prev,
      [criterionId]: value
    }))
  }

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600'
    if (score >= 7) return 'text-green-500'
    if (score >= 4) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8.5) return 'Mükemmel'
    if (score >= 7) return 'İyi'
    if (score >= 4) return 'Orta'
    return 'Zayıf'
  }

  const getScoreDescription = (score: number) => {
    if (score >= 8.5) return 'Bu ürün sektörde öncü konumda'
    if (score >= 7) return 'Güvenilir ve kaliteli bir seçim'
    if (score >= 4) return 'Temel ihtiyaçları karşılar'
    return 'Alternatif ürünleri değerlendirin'
  }

  const ProfileIcon = profiles[currentProfile as keyof typeof profiles].icon

  return (
    <div className="space-y-6">
      {/* Profile Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ProfileIcon className="w-5 h-5" />
            Değerlendirme Profili
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(profiles).map(([key, profileData]) => {
              const Icon = profileData.icon
              return (
                <Button
                  key={key}
                  variant={currentProfile === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentProfile(key as keyof typeof profiles)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {profileData.name}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Overall Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(totalScore)}`}>
              {totalScore.toFixed(1)}
            </div>
            <div className="text-lg font-semibold mt-2">
              {getScoreLabel(totalScore)}
            </div>
            <p className="text-muted-foreground mt-1">
              {getScoreDescription(totalScore)}
            </p>
            <div className="mt-4">
              <Progress value={totalScore * 10} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Criteria */}
      <div className="space-y-4">
        {criteria.map((criterion) => {
          const Icon = criterion.icon
          const profileWeight = (profiles[currentProfile as keyof typeof profiles].adjustments as Record<string, number>)[criterion.id] || criterion.weight
          
          return (
            <Card key={criterion.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{criterion.name}</h3>
                        <p className="text-sm text-muted-foreground">{criterion.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${getScoreColor(scores[criterion.id])}`}>
                        {scores[criterion.id].toFixed(1)}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Ağırlık: %{(profileWeight * 100).toFixed(0)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">0</span>
                      <Slider
                        value={[scores[criterion.id]]}
                        onValueChange={([value]) => updateScore(criterion.id, value)}
                        max={10}
                        min={0}
                        step={0.1}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">10</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Çok Zayıf</span>
                      <span>Mükemmel</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı Ayarlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScores({
                performance: 5,
                stability: 5,
                coverage: 5,
                software: 5,
                value: 5
              })}
            >
              Sıfırla
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScores({
                performance: 8,
                stability: 8,
                coverage: 8,
                software: 8,
                value: 8
              })}
            >
              Yüksek Puan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScores({
                performance: 6,
                stability: 6,
                coverage: 6,
                software: 6,
                value: 6
              })}
            >
              Orta Puan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
