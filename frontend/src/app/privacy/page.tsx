import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Eye, Database, Users, Mail, Lock } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Gizlilik Politikası</h1>
          </div>
          <p className="text-muted-foreground">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Bilgi Toplama
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Hardware Review sitesi olarak, kullanıcılarımızın gizliliğini korumak bizim için önemlidir. 
                Bu gizlilik politikası, kişisel bilgilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.
              </p>
              
              <div>
                <h4 className="font-semibold mb-2">Topladığımız Bilgiler:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Kayıt olurken verdiğiniz ad, e-posta adresi ve şifre</li>
                  <li>Site kullanımı sırasında otomatik olarak toplanan teknik bilgiler (IP adresi, tarayıcı türü, işletim sistemi)</li>
                  <li>Çerezler ve benzeri teknolojiler aracılığıyla toplanan veriler</li>
                  <li>Yorumlar, değerlendirmeler ve site etkileşimleriniz</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Bilgi Kullanımı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Topladığımız bilgileri aşağıdaki amaçlarla kullanırız:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Hesap Yönetimi
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Hesabınızı oluşturmak, yönetmek ve kimlik doğrulama
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    İletişim
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Size önemli güncellemeler ve bildirimler gönderme
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Site İyileştirme
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Site performansını analiz etme ve kullanıcı deneyimini geliştirme
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-start">
                    <Lock className="w-4 h-4 mr-2" />
                    Güvenlik
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Site güvenliğini sağlama ve kötüye kullanımı önleme
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Bilgi Güvenliği
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Kişisel bilgilerinizi korumak için aşağıdaki güvenlik önlemlerini alıyoruz:
              </p>
              
              <ul className="list-disc list-inside space-y-2">
                <li>SSL şifreleme ile veri iletimi</li>
                <li>Güvenli sunucu altyapısı</li>
                <li>Düzenli güvenlik güncellemeleri</li>
                <li>Erişim kontrolü ve yetkilendirme</li>
                <li>Veri yedekleme ve kurtarma prosedürleri</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Çerezler ve Takip Teknolojileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Sitemizde kullanıcı deneyimini geliştirmek için çerezler ve benzeri teknolojiler kullanırız:
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Zorunlu Çerezler</h4>
                  <p className="text-sm text-muted-foreground">
                    Site işlevselliği için gerekli olan çerezler
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Analitik Çerezler</h4>
                  <p className="text-sm text-muted-foreground">
                    Site kullanımını analiz etmek için kullanılan çerezler
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Tercih Çerezleri</h4>
                  <p className="text-sm text-muted-foreground">
                    Kullanıcı tercihlerini hatırlamak için kullanılan çerezler
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Haklarınız</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında aşağıdaki haklara sahipsiniz:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Bilgi Alma Hakkı</h4>
                  <p className="text-sm text-muted-foreground">
                    Hangi kişisel verilerinizin işlendiğini öğrenme
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Düzeltme Hakkı</h4>
                  <p className="text-sm text-muted-foreground">
                    Yanlış bilgilerin düzeltilmesini isteme
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Silme Hakkı</h4>
                  <p className="text-sm text-muted-foreground">
                    Kişisel verilerinizin silinmesini isteme
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">İtiraz Hakkı</h4>
                  <p className="text-sm text-muted-foreground">
                    Veri işlemeye itiraz etme
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>İletişim</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Gizlilik politikamız hakkında sorularınız varsa bizimle iletişime geçebilirsiniz:
              </p>
              
              <div className="space-y-2">
                <p><strong>E-posta:</strong> privacy@hardwarereview.com</p>
                <p><strong>Adres:</strong> Hardware Review Ltd. Şti.</p>
                <p><strong>Telefon:</strong> +90 (212) 555-0123</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Bu gizlilik politikası düzenli olarak güncellenebilir. Önemli değişiklikler durumunda 
                kullanıcılarımızı e-posta yoluyla bilgilendiririz.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Gizlilik Politikası | Hardware Review',
  description: 'Hardware Review sitesi gizlilik politikası ve kişisel veri koruma bilgileri.',
  robots: 'index, follow'
}

