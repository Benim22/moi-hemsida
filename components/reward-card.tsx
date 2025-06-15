"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gift, Star, Trophy, Zap } from "lucide-react"

interface RewardProgram {
  id: number
  name: string
  description: string
  requiredStamps: number
  rewardDescription: string
  isActive: boolean
}

interface UserReward {
  currentStamps: number
  totalRedeemed: number
  canRedeem: boolean
}

interface RewardCardProps {
  program: RewardProgram
  userReward: UserReward
  onRedeem?: () => void
}

export function RewardCard({ program, userReward, onRedeem }: RewardCardProps) {
  const progressPercentage = (userReward.currentStamps / program.requiredStamps) * 100
  const stampsNeeded = program.requiredStamps - userReward.currentStamps

  return (
    <Card className="border border-[#e4d699]/20 bg-gradient-to-br from-black/50 to-[#e4d699]/5 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#e4d699]/5 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#e4d699]/3 rounded-full translate-y-12 -translate-x-12" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#e4d699]/10 rounded-lg">
              <Gift className="h-6 w-6 text-[#e4d699]" />
            </div>
            <div>
              <CardTitle className="text-lg">{program.name}</CardTitle>
              <CardDescription>{program.description}</CardDescription>
            </div>
          </div>
          {userReward.canRedeem && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Trophy className="h-3 w-3 mr-1" />
              Redo att lösa in!
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Framsteg</span>
            <span className="text-sm text-[#e4d699]">
              {userReward.currentStamps}/{program.requiredStamps} köp
            </span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-3 bg-black/30"
          />
          
          <div className="flex justify-between text-xs text-white/60">
            <span>
              {stampsNeeded > 0 ? `${stampsNeeded} köp kvar` : "Klart att lösa in!"}
            </span>
            <span>{Math.round(progressPercentage)}% klart</span>
          </div>
        </div>

        {/* Stamps Visualization */}
        <div className="grid grid-cols-5 gap-2 py-4">
          {Array.from({ length: program.requiredStamps }, (_, index) => (
            <div
              key={index}
              className={`
                aspect-square rounded-full border-2 flex items-center justify-center text-xs font-bold
                ${index < userReward.currentStamps
                  ? "bg-[#e4d699] border-[#e4d699] text-black"
                  : "border-[#e4d699]/30 text-[#e4d699]/50"
                }
              `}
            >
              {index < userReward.currentStamps ? (
                <Star className="h-3 w-3" fill="currentColor" />
              ) : (
                index + 1
              )}
            </div>
          ))}
        </div>

        {/* Reward Description */}
        <div className="p-3 bg-[#e4d699]/5 rounded-lg border border-[#e4d699]/20">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-[#e4d699]" />
            <span className="font-medium text-sm">Din belöning:</span>
          </div>
          <p className="text-sm text-white/80">{program.rewardDescription}</p>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center pt-2 border-t border-[#e4d699]/10">
          <div className="text-center">
            <div className="text-lg font-bold text-[#e4d699]">{userReward.totalRedeemed}</div>
            <div className="text-xs text-white/60">Inlösta belöningar</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-[#e4d699]">{userReward.currentStamps}</div>
            <div className="text-xs text-white/60">Aktuella stämplar</div>
          </div>
        </div>

        {/* Action Button */}
        {userReward.canRedeem ? (
          <Button 
            onClick={onRedeem}
            className="w-full bg-gradient-to-r from-[#e4d699] to-[#f0e6a6] text-black hover:from-[#e4d699]/90 hover:to-[#f0e6a6]/90 font-medium"
          >
            <Gift className="h-4 w-4 mr-2" />
            Lös in belöning
          </Button>
        ) : (
          <Button 
            disabled
            variant="outline"
            className="w-full border-[#e4d699]/30 text-[#e4d699]/60"
          >
            {stampsNeeded} köp kvar till belöning
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Kompakt version för mindre utrymmen
export function CompactRewardCard({ program, userReward }: Omit<RewardCardProps, 'onRedeem'>) {
  const progressPercentage = (userReward.currentStamps / program.requiredStamps) * 100

  return (
    <Card className="border border-[#e4d699]/20 bg-black/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-[#e4d699]" />
            <span className="font-medium text-sm">{program.name}</span>
          </div>
          {userReward.canRedeem && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              Redo!
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-white/60">
            <span>{userReward.currentStamps}/{program.requiredStamps}</span>
            <span>{userReward.totalRedeemed} inlösta</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 