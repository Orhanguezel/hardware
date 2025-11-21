import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cookie, Settings, BarChart3, Shield, Eye, Clock } from 'lucide-react'

export default function CookiePolicyPage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Cookie className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Çerez Politikası</h1>
          </div>
          <p className="text-muted-foreground">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="w-5 h-5" />
                Çerez Nedir?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Çerezler, web sitelerini ziyaret ettiğinizde tarayıcınızda saklanan küçük metin dosyalarıdır. 
                Bu dosyalar, site deneyiminizi geliştirmek ve size daha kişiselleştirilmiş içerik sunmak için kullanılır.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Önemli:</strong> Çerezler kişisel bilgilerinizi doğrudan saklamaz, ancak 
                  tarayıcınızın benzersiz kimliğini tanımlayabilir.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Çerez Türleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Sitemizde farklı amaçlarla kullanılan çerez türleri bulunmaktadır:
              </p>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold">Zorunlu Çerezler</h4>
                    <Badge variant="secondary">Gerekli</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Site işlevselliği için mutlaka gerekli olan çerezlerdir.
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Oturum yönetimi ve güvenlik</li>
                    <li>Form verilerinin korunması</li>
                    <li>Kullanıcı tercihlerinin hatırlanması</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold">Analitik Çerezler</h4>
                    <Badge variant="outline">İsteğe Bağlı</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Site kullanımını analiz etmek ve performansı ölçmek için kullanılır.
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Sayfa görüntüleme istatistikleri</li>
                    <li>Kullanıcı davranış analizi</li>
                    <li>Site performans metrikleri</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold">Tercih Çerezleri</h4>
                    <Badge variant="outline">İsteğe Bağlı</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Kullanıcı tercihlerini hatırlamak için kullanılır.
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Dil tercihi</li>
                    <li>Tema seçimi (açık/koyu)</li>
                    <li>Bildirim ayarları</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold">Geçici Çerezler</h4>
                    <Badge variant="outline">Geçici</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Kısa süreli işlemler için kullanılan çerezlerdir.
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Alışveriş sepeti bilgileri</li>
                    <li>Geçici form verileri</li>
                    <li>Oturum durumu</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Çerez Kullanım Amaçları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Çerezleri aşağıdaki amaçlarla kullanırız:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Güvenlik
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Site güvenliğini sağlama ve kötüye kullanımı önleme
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Kişiselleştirme
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Kullanıcı deneyimini kişiselleştirme
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analitik
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Site performansını analiz etme
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    İçerik Optimizasyonu
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    İçerik ve özellikleri geliştirme
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Çerez Yönetimi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Çerez tercihlerinizi aşağıdaki yöntemlerle yönetebilirsiniz:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Tarayıcı Ayarları</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Çoğu tarayıcıda çerezleri engelleyebilir veya silebilirsiniz:
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                    <li><strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler</li>
                    <li><strong>Firefox:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler</li>
                    <li><strong>Safari:</strong> Tercihler → Gizlilik → Çerezler</li>
                    <li><strong>Edge:</strong> Ayarlar → Çerezler ve site izinleri</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Site Ayarları</h4>
                  <p className="text-sm text-muted-foreground">
                    Sitemizde çerez tercihlerinizi ayarlayabilirsiniz. Ayarlar sayfasından 
                    istemediğiniz çerez türlerini devre dışı bırakabilirsiniz.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Üçüncü Taraf Çerezler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Sitemizde üçüncü taraf hizmetlerinin çerezleri de kullanılabilir:
              </p>
              
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold mb-1">Google Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    Site trafiğini analiz etmek için kullanılır. 
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                      Google Gizlilik Politikası
                    </a>
                  </p>
                </div>
                
                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold mb-1">Sosyal Medya Entegrasyonları</h4>
                  <p className="text-sm text-muted-foreground">
                    Facebook, Twitter gibi sosyal medya paylaşım özellikleri için kullanılır.
                  </p>
                </div>
                
                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold mb-1">Reklam Ağları</h4>
                  <p className="text-sm text-muted-foreground">
                    Kişiselleştirilmiş reklamlar göstermek için kullanılır.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Çerez Saklama Süreleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Farklı çerez türleri farklı sürelerde saklanır:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">Oturum Çerezleri</h4>
                    <p className="text-sm text-muted-foreground">Tarayıcı kapatıldığında silinir</p>
                  </div>
                  <Badge variant="outline">Geçici</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">Kalıcı Çerezler</h4>
                    <p className="text-sm text-muted-foreground">Belirli bir süre boyunca saklanır</p>
                  </div>
                  <Badge variant="outline">30-365 gün</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">Tercih Çerezleri</h4>
                    <p className="text-sm text-muted-foreground">Kullanıcı tercihlerini hatırlar</p>
                  </div>
                  <Badge variant="outline">1-2 yıl</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Çerez Tercihlerinizi Değiştirme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz:
              </p>
              
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-green-800 dark:text-green-200">Nasıl Değiştiririm?</h4>
                <ol className="list-decimal list-inside text-sm space-y-1 text-green-700 dark:text-green-300">
                  <li>Tarayıcınızın ayarlar menüsüne gidin</li>
                  <li>"Gizlilik" veya "Çerezler" bölümünü bulun</li>
                  <li>İstediğiniz çerez türlerini seçin/kaldırın</li>
                  <li>Değişiklikleri kaydedin</li>
                </ol>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Uyarı:</strong> Bazı çerezleri devre dışı bırakırsanız, 
                  sitenin bazı özellikleri düzgün çalışmayabilir.
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
                Çerez politikası hakkında sorularınız varsa bizimle iletişime geçebilirsiniz:
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
                Bu çerez politikası düzenli olarak güncellenebilir. Önemli değişiklikler durumunda 
                kullanıcılarımızı bilgilendiririz.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Çerez Politikası | Hardware Review',
  description: 'Hardware Review sitesi çerez politikası ve çerez kullanım bilgileri.',
  robots: 'index, follow'
}

