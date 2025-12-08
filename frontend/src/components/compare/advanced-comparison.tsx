"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Check, X, Minus } from "lucide-react";

interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  image: string;
  price: number;
  specs: {
    wifiStandard: string;
    bands: string[];
    maxSpeed: string;
    ports: { wan: number; lan: number };
    features: string[];
  };
  scores: {
    performance: number;
    stability: number;
    coverage: number;
    software: number;
    value: number;
  };
  pros: string[];
  cons: string[];
}

interface ComparisonProps {
  products: Product[];
  onWinnerChange?: (winner: Product | null) => void;
}

// Sabit ağırlıkları komponentin dışına aldık
const DEFAULT_COMPARISON_CRITERIA = {
  performance: 0.35,
  stability: 0.25,
  coverage: 0.2,
  software: 0.1,
  value: 0.1,
} as const;

type ComparisonCriteria = typeof DEFAULT_COMPARISON_CRITERIA;

export default function AdvancedComparison({
  products,
  onWinnerChange,
}: ComparisonProps) {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(() =>
    products.slice(0, 2),
  );
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [winner, setWinner] = useState<Product | null>(null);

  // products prop değişirse ilk iki ürünü tekrar seç
  useEffect(() => {
    setSelectedProducts(products.slice(0, 2));
  }, [products]);

  // Kazananı hesaplayan efekt
  useEffect(() => {
    if (selectedProducts.length < 2) {
      setWinner(null);
      onWinnerChange?.(null);
      return;
    }

    const scores = selectedProducts.map((product) => {
      let totalScore = 0;

      (
        Object.entries(
          DEFAULT_COMPARISON_CRITERIA,
        ) as [keyof ComparisonCriteria, number][]
      ).forEach(([criterion, weight]) => {
        totalScore += product.scores[criterion] * weight;
      });

      return { product, score: totalScore };
    });

    scores.sort((a, b) => b.score - a.score);

    const newWinner =
      scores.length >= 2 && scores[0].score > scores[1].score
        ? scores[0].product
        : null;

    setWinner(newWinner);
    onWinnerChange?.(newWinner);
  }, [selectedProducts, onWinnerChange]);

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return "text-green-600";
    if (score >= 7) return "text-green-500";
    if (score >= 4) return "text-yellow-500";
    return "text-red-500";
  };

  const getComparisonResult = (
    productA: Product,
    productB: Product,
    criterion: keyof Product["scores"],
  ) => {
    const scoreA = productA.scores[criterion];
    const scoreB = productB.scores[criterion];

    if (Math.abs(scoreA - scoreB) < 0.5) return "tie";
    return scoreA > scoreB ? "win" : "lose";
  };

  const hasSignificantDifference = (
    productA: Product,
    productB: Product,
    criterion: keyof Product["scores"],
  ) => {
    const scoreA = productA.scores[criterion];
    const scoreB = productB.scores[criterion];
    return Math.abs(scoreA - scoreB) >= 0.5;
  };

  const hasSpecDifference = (
    productA: Product,
    productB: Product,
    specKey: "wifiStandard" | "maxSpeed",
  ) => {
    const specA = productA.specs[specKey];
    const specB = productB.specs[specKey];
    return specA !== specB;
  };

  const shouldShowRow = (
    productA: Product,
    productB: Product,
    criterion: string,
  ) => {
    if (!showOnlyDifferences) return true;

    // skor kriterleri
    if (
      criterion === "performance" ||
      criterion === "stability" ||
      criterion === "coverage" ||
      criterion === "software" ||
      criterion === "value"
    ) {
      return hasSignificantDifference(
        productA,
        productB,
        criterion as keyof Product["scores"],
      );
    }

    // spesifikasyon kriterleri
    if (criterion === "wifiStandard" || criterion === "maxSpeed") {
      return hasSpecDifference(
        productA,
        productB,
        criterion as "wifiStandard" | "maxSpeed",
      );
    }

    if (criterion === "lanPorts") {
      return productA.specs.ports.lan !== productB.specs.ports.lan;
    }

    if (criterion === "price") {
      // Fiyat farkı 100 TL’den fazlaysa göster
      return Math.abs(productA.price - productB.price) > 100;
    }

    return true;
  };

  const ComparisonIcon = ({ result }: { result: string }) => {
    if (result === "win") return <Check className="h-4 w-4 text-green-600" />;
    if (result === "lose") return <X className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  if (selectedProducts.length < 2) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-muted-foreground">
              Karşılaştırma için en az 2 ürün seçin
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const productA = selectedProducts[0];
  const productB = selectedProducts[1];

  return (
    <div className="space-y-6">
      {/* Winner Announcement */}
      {winner && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Trophy className="mx-auto mb-4 h-12 w-12 text-green-600" />
              <h3 className="mb-2 text-xl font-bold text-green-800">
                🏆 Kazanan: {winner.brand} {winner.model}
              </h3>
              <p className="text-green-700">
                Seçilen kriterlere göre en iyi performans gösteren ürün
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Comparison Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detaylı Karşılaştırma</CardTitle>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showOnlyDifferences"
                checked={showOnlyDifferences}
                onChange={(e) => setShowOnlyDifferences(e.target.checked)}
                className="rounded"
              />
              <label
                htmlFor="showOnlyDifferences"
                className="text-sm font-medium"
              >
                Sadece farkları göster
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left">Kriter</th>
                  <th className="min-w-[200px] p-4 text-center">
                    <div className="text-center">
                      <Image
                        src={productA.image}
                        alt={productA.name}
                        width={64}
                        height={64}
                        className="mx-auto mb-2 h-16 w-16 rounded"
                      />
                      <h3 className="font-semibold">{productA.brand}</h3>
                      <p className="text-sm text-muted-foreground">
                        {productA.model}
                      </p>
                    </div>
                  </th>
                  <th className="min-w-[200px] p-4 text-center">
                    <div className="text-center">
                      <Image
                        src={productB.image}
                        alt={productB.name}
                        width={64}
                        height={64}
                        className="mx-auto mb-2 h-16 w-16 rounded"
                      />
                      <h3 className="font-semibold">{productB.brand}</h3>
                      <p className="text-sm text-muted-foreground">
                        {productB.model}
                      </p>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Performance */}
                {shouldShowRow(productA, productB, "performance") && (
                  <tr className="border-b">
                    <td className="p-4 font-medium">Performans</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`font-bold ${getScoreColor(
                            productA.scores.performance,
                          )}`}
                        >
                          {productA.scores.performance.toFixed(1)}
                        </span>
                        <ComparisonIcon
                          result={getComparisonResult(
                            productA,
                            productB,
                            "performance",
                          )}
                        />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`font-bold ${getScoreColor(
                            productB.scores.performance,
                          )}`}
                        >
                          {productB.scores.performance.toFixed(1)}
                        </span>
                        <ComparisonIcon
                          result={getComparisonResult(
                            productB,
                            productA,
                            "performance",
                          )}
                        />
                      </div>
                    </td>
                  </tr>
                )}

                {/* Stability */}
                {shouldShowRow(productA, productB, "stability") && (
                  <tr className="border-b">
                    <td className="p-4 font-medium">İstikrar & Ping</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`font-bold ${getScoreColor(
                            productA.scores.stability,
                          )}`}
                        >
                          {productA.scores.stability.toFixed(1)}
                        </span>
                        <ComparisonIcon
                          result={getComparisonResult(
                            productA,
                            productB,
                            "stability",
                          )}
                        />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`font-bold ${getScoreColor(
                            productB.scores.stability,
                          )}`}
                        >
                          {productB.scores.stability.toFixed(1)}
                        </span>
                        <ComparisonIcon
                          result={getComparisonResult(
                            productB,
                            productA,
                            "stability",
                          )}
                        />
                      </div>
                    </td>
                  </tr>
                )}

                {/* Coverage */}
                {shouldShowRow(productA, productB, "coverage") && (
                  <tr className="border-b">
                    <td className="p-4 font-medium">Kapsama & Çekim</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`font-bold ${getScoreColor(
                            productA.scores.coverage,
                          )}`}
                        >
                          {productA.scores.coverage.toFixed(1)}
                        </span>
                        <ComparisonIcon
                          result={getComparisonResult(
                            productA,
                            productB,
                            "coverage",
                          )}
                        />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`font-bold ${getScoreColor(
                            productB.scores.coverage,
                          )}`}
                        >
                          {productB.scores.coverage.toFixed(1)}
                        </span>
                        <ComparisonIcon
                          result={getComparisonResult(
                            productB,
                            productA,
                            "coverage",
                          )}
                        />
                      </div>
                    </td>
                  </tr>
                )}

                {/* Software */}
                {shouldShowRow(productA, productB, "software") && (
                  <tr className="border-b">
                    <td className="p-4 font-medium">Yazılım & Arayüz</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`font-bold ${getScoreColor(
                            productA.scores.software,
                          )}`}
                        >
                          {productA.scores.software.toFixed(1)}
                        </span>
                        <ComparisonIcon
                          result={getComparisonResult(
                            productA,
                            productB,
                            "software",
                          )}
                        />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`font-bold ${getScoreColor(
                            productB.scores.software,
                          )}`}
                        >
                          {productB.scores.software.toFixed(1)}
                        </span>
                        <ComparisonIcon
                          result={getComparisonResult(
                            productB,
                            productA,
                            "software",
                          )}
                        />
                      </div>
                    </td>
                  </tr>
                )}

                {/* Value */}
                {shouldShowRow(productA, productB, "value") && (
                  <tr className="border-b">
                    <td className="p-4 font-medium">Fiyat & Değer</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`font-bold ${getScoreColor(
                            productA.scores.value,
                          )}`}
                        >
                          {productA.scores.value.toFixed(1)}
                        </span>
                        <ComparisonIcon
                          result={getComparisonResult(
                            productA,
                            productB,
                            "value",
                          )}
                        />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`font-bold ${getScoreColor(
                            productB.scores.value,
                          )}`}
                        >
                          {productB.scores.value.toFixed(1)}
                        </span>
                        <ComparisonIcon
                          result={getComparisonResult(
                            productB,
                            productA,
                            "value",
                          )}
                        />
                      </div>
                    </td>
                  </tr>
                )}

                {/* Price */}
                {shouldShowRow(productA, productB, "price") && (
                  <tr className="border-b">
                    <td className="p-4 font-medium">Fiyat</td>
                    <td className="p-4 text-center font-semibold">
                      ₺{productA.price.toLocaleString()}
                    </td>
                    <td className="p-4 text-center font-semibold">
                      ₺{productB.price.toLocaleString()}
                    </td>
                  </tr>
                )}

                {/* Wi-Fi Standard */}
                {shouldShowRow(productA, productB, "wifiStandard") && (
                  <tr className="border-b">
                    <td className="p-4 font-medium">Wi-Fi Standardı</td>
                    <td className="p-4 text-center">
                      <Badge variant="outline">
                        {productA.specs.wifiStandard}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="outline">
                        {productB.specs.wifiStandard}
                      </Badge>
                    </td>
                  </tr>
                )}

                {/* Max Speed */}
                {shouldShowRow(productA, productB, "maxSpeed") && (
                  <tr className="border-b">
                    <td className="p-4 font-medium">Maksimum Hız</td>
                    <td className="p-4 text-center">
                      {productA.specs.maxSpeed}
                    </td>
                    <td className="p-4 text-center">
                      {productB.specs.maxSpeed}
                    </td>
                  </tr>
                )}

                {/* LAN Ports */}
                {shouldShowRow(productA, productB, "lanPorts") && (
                  <tr className="border-b">
                    <td className="p-4 font-medium">LAN Portları</td>
                    <td className="p-4 text-center">
                      {productA.specs.ports.lan}
                    </td>
                    <td className="p-4 text-center">
                      {productB.specs.ports.lan}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pros and Cons */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {selectedProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {product.brand} {product.model}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Pros */}
                <div>
                  <h4 className="mb-2 flex items-center gap-2 font-semibold text-green-800">
                    <Check className="h-4 w-4" />
                    Artılar
                  </h4>
                  <ul className="space-y-1">
                    {product.pros.map((pro, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-green-700"
                      >
                        <span className="mt-1 text-green-500">•</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons */}
                <div>
                  <h4 className="mb-2 flex items-center gap-2 font-semibold text-red-800">
                    <X className="h-4 w-4" />
                    Eksiler
                  </h4>
                  <ul className="space-y-1">
                    {product.cons.map((con, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-red-700"
                      >
                        <span className="mt-1 text-red-500">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Genel Puanlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {selectedProducts.map((product) => {
              const totalScore =
                Object.values(product.scores).reduce(
                  (sum, score) => sum + score,
                  0,
                ) / Object.keys(product.scores).length;

              return (
                <div key={product.id} className="text-center">
                  <div
                    className={`text-3xl font-bold ${getScoreColor(
                      totalScore,
                    )}`}
                  >
                    {totalScore.toFixed(1)}
                  </div>
                  <div className="mt-2 text-lg font-semibold">
                    {product.brand} {product.model}
                  </div>
                  <div className="mt-2">
                    <Progress value={totalScore * 10} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
