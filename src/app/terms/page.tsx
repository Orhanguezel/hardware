import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, AlertTriangle, Shield, Users, Ban, Scale } from 'lucide-react'

export default function TermsOfUsePage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Kullanım Şartları</h1>
          </div>
          <p className="text-muted-foreground">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Genel Hükümler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Bu kullanım şartları, Hardware Review web sitesini kullanırken uymanız gereken kuralları 
                ve koşulları belirler. Siteyi kullanarak bu şartları kabul etmiş sayılırsınız.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Önemli:</strong> Bu şartları dikkatle okuyun. Siteyi kullanmaya devam etmeniz, 
                  bu şartları kabul ettiğiniz anlamına gelir.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Kullanıcı Sorumlulukları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Siteyi kullanırken aşağıdaki kurallara uymanız gerekmektedir:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400 text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Doğru Bilgi Verme</h4>
                    <p className="text-sm text-muted-foreground">
                      Kayıt olurken doğru ve güncel bilgiler vermeniz gerekmektedir.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400 text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Saygılı İletişim</h4>
                    <p className="text-sm text-muted-foreground">
                      Diğer kullanıcılara saygılı davranmalı ve uygunsuz içerik paylaşmamalısınız.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400 text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Telif Hakları</h4>
                    <p className="text-sm text-muted-foreground">
                      Başkalarının telif haklarına saygı göstermeli ve izinsiz içerik paylaşmamalısınız.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="w-5 h-5" />
                Yasaklanan Faaliyetler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Aşağıdaki faaliyetler kesinlikle yasaktır:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Badge variant="destructive" className="w-full justify-start">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Spam ve Reklam
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    İstenmeyen mesajlar, spam ve reklam içerikleri paylaşmak
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Badge variant="destructive" className="w-full justify-start">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Zararlı Yazılım
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Virüs, malware veya zararlı kod paylaşmak
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Badge variant="destructive" className="w-full justify-start">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Sahte Hesap
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Sahte kimlik veya birden fazla hesap oluşturmak
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Badge variant="destructive" className="w-full justify-start">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Sistem Saldırısı
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Site altyapısına zarar vermeye çalışmak
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                İçerik ve Telif Hakları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Sitede bulunan tüm içerikler telif hakkı koruması altındadır:
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Site İçeriği</h4>
                  <p className="text-sm text-muted-foreground">
                    Makaleler, incelemeler, görseller ve diğer içerikler Hardware Review'e aittir.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Kullanıcı İçeriği</h4>
                  <p className="text-sm text-muted-foreground">
                    Paylaştığınız yorumlar ve değerlendirmeler sizin sorumluluğunuzdadır.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold">İzin ve Lisans</h4>
                  <p className="text-sm text-muted-foreground">
                    İçerikleri izinsiz kopyalamak, dağıtmak veya ticari amaçla kullanmak yasaktır.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hizmet Kullanımı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Sitemizdeki hizmetleri kullanırken dikkat edilmesi gerekenler:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold">Ücretsiz Hizmet</h4>
                    <p className="text-sm text-muted-foreground">
                      Temel site özellikleri ücretsizdir, ancak premium özellikler ücretli olabilir.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold">Hizmet Kesintileri</h4>
                    <p className="text-sm text-muted-foreground">
                      Bakım ve güncellemeler nedeniyle hizmet kesintileri olabilir.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold">Değişiklikler</h4>
                    <p className="text-sm text-muted-foreground">
                      Hizmetlerimizi önceden haber vermeksizin değiştirebiliriz.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sorumluluk Reddi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Hardware Review aşağıdaki konularda sorumluluk kabul etmez:
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">İçerik Doğruluğu</h4>
                  <p className="text-sm text-muted-foreground">
                    Makale ve incelemelerdeki bilgilerin doğruluğunu garanti etmez.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Üçüncü Taraf Bağlantıları</h4>
                  <p className="text-sm text-muted-foreground">
                    Dış sitelere yönlendirmelerden sorumlu değildir.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Teknik Sorunlar</h4>
                  <p className="text-sm text-muted-foreground">
                    Sistem arızalarından kaynaklanan veri kayıplarından sorumlu değildir.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hesap Askıya Alma ve Sonlandırma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Aşağıdaki durumlarda hesabınız askıya alınabilir veya sonlandırılabilir:
              </p>
              
              <ul className="list-disc list-inside space-y-2">
                <li>Kullanım şartlarını ihlal etmeniz</li>
                <li>Sahte bilgi vermeniz</li>
                <li>Spam veya zararlı içerik paylaşmanız</li>
                <li>Diğer kullanıcılara zarar vermeniz</li>
                <li>Site güvenliğini tehdit etmeniz</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Değişiklikler ve Güncellemeler</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Bu kullanım şartları düzenli olarak güncellenebilir. Önemli değişiklikler durumunda 
                kullanıcılarımızı bilgilendiririz.
              </p>
              
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Uyarı:</strong> Şartlardaki değişiklikleri takip etmek sizin sorumluluğunuzdadır. 
                  Siteyi kullanmaya devam etmeniz güncel şartları kabul ettiğiniz anlamına gelir.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>İletişim</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Kullanım şartları hakkında sorularınız varsa bizimle iletişime geçebilirsiniz:
              </p>
              
              <div className="space-y-2">
                <p><strong>E-posta:</strong> legal@hardwarereview.com</p>
                <p><strong>Adres:</strong> Hardware Review Ltd. Şti.</p>
                <p><strong>Telefon:</strong> +90 (212) 555-0123</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Kullanım Şartları | Hardware Review',
  description: 'Hardware Review sitesi kullanım şartları ve kuralları.',
  robots: 'index, follow'
}

