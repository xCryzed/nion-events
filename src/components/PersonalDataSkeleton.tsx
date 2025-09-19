import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Calendar,
  MapPin,
  CreditCard,
  Building,
  GraduationCap,
  FileText,
} from "lucide-react";

export const PersonalDataSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-primary flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Personaldaten
            </h1>
            <Skeleton className="w-20 h-6" />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 ml-auto">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-24 h-6" />
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex flex-col sm:flex-row gap-2 justify-between">
          <div className="flex flex-col sm:flex-row gap-2">
            <Skeleton className="w-32 h-10" />
            <Skeleton className="w-48 h-10" />
          </div>
          <Skeleton className="w-24 h-10" />
        </div>
      </div>

      {/* Content Cards Skeleton */}
      <div className="space-y-6">
        {/* Personal Information Card */}
        <Card className="glass-card bg-white/5 border-white/10 text-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary flex-shrink-0" />
              <Skeleton className="w-48 h-6" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="w-20 h-4 mb-1" />
                    <Skeleton className="w-full h-5" />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="w-20 h-4 mb-1" />
                    <Skeleton className="w-full h-5" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Data Card */}
        <Card className="glass-card bg-white/5 border-white/10 text-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-primary flex-shrink-0" />
              <Skeleton className="w-40 h-6" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="w-24 h-4 mb-1" />
                    <Skeleton className="w-full h-5" />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="w-24 h-4 mb-1" />
                    <Skeleton className="w-full h-5" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details Card */}
        <Card className="glass-card bg-white/5 border-white/10 text-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-primary flex-shrink-0" />
              <Skeleton className="w-32 h-6" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="w-16 h-4 mb-1" />
                    <Skeleton className="w-full h-5" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Cards */}
        {[...Array(3)].map((_, cardIndex) => (
          <Card
            key={cardIndex}
            className="glass-card bg-white/5 border-white/10 text-white"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                {cardIndex === 0 && (
                  <GraduationCap className="w-5 h-5 text-primary flex-shrink-0" />
                )}
                {cardIndex === 1 && (
                  <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                )}
                {cardIndex === 2 && (
                  <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                )}
                <Skeleton className="w-36 h-6" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i}>
                      <Skeleton className="w-20 h-4 mb-1" />
                      <Skeleton className="w-full h-5" />
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i}>
                      <Skeleton className="w-20 h-4 mb-1" />
                      <Skeleton className="w-full h-5" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
