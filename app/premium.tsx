import React, { useState } from 'react'
import { Linking } from 'react-native'
import {
  StyledPage, StyledScrollView, Stack,
  StyledCard, StyledButton, StyledPressable,
} from 'fluent-styles'
import { Text } from '../src/components/Text'
import { ScreenHeader } from '../src/components/ScreenHeader'
import { useColors, useIsDark } from '../src/constants'
import { PREMIUM_FEATURES, PREMIUM_PRICING } from '../src/constants/premium'
import { usePremium } from '../src/hooks/usePremium'
import { goBack } from '../src/utils'
import { SparkleIcon, CheckCircleIcon } from '../src/icons'
import type { PremiumPlan } from '../src/services/premiumService'

// Reuses premiumService's own plan type (minus the "not subscribed" null
// case, which doesn't apply to a plan the user is actively picking) rather
// than a separately hand-maintained copy of the same three literals.
type PlanKey = Exclude<PremiumPlan, null>

// Source: docs/privacy.html and docs/terms.html in this repo — enable
// GitHub Pages (Settings → Pages → Source: main /docs) to serve these at
// the URLs below. Until that's turned on, these 404 — check before
// submitting to either store, both require a working privacy policy URL
// for an app with subscriptions.
const PRIVACY_POLICY_URL = 'https://suftnetrepo.github.io/nailbid/privacy.html'
const TERMS_URL           = 'https://suftnetrepo.github.io/nailbid/terms.html'

export default function PremiumScreen() {
  const C = useColors()
  const isDark = useIsDark()
  const {
    isPremium, plan, buyMonthly, buyYearly, buyLifetime, restore, resetForTesting,
    monthlyPrice, yearlyPrice, lifetimePrice,
  } = usePremium()

  const [selected, setSelected] = useState<PlanKey>('yearly')
  const [busy, setBusy] = useState(false)

  const PLANS: { key: PlanKey; label: string; price: string; period: string; saving?: string }[] = [
    { key: 'monthly',  label: 'Monthly',  price: monthlyPrice  ?? PREMIUM_PRICING.MONTHLY.price,  period: PREMIUM_PRICING.MONTHLY.period },
    { key: 'yearly',   label: 'Yearly',   price: yearlyPrice   ?? PREMIUM_PRICING.YEARLY.price,   period: PREMIUM_PRICING.YEARLY.period, saving: PREMIUM_PRICING.YEARLY.saving },
    { key: 'lifetime', label: 'Lifetime', price: lifetimePrice ?? PREMIUM_PRICING.LIFETIME.price, period: PREMIUM_PRICING.LIFETIME.period },
  ]

  const handleContinue = async () => {
    setBusy(true)
    try {
      const buy = selected === 'monthly' ? buyMonthly : selected === 'yearly' ? buyYearly : buyLifetime
      const ok = await buy()
      if (ok) goBack('/settings')
    } finally {
      setBusy(false)
    }
  }

  const handleRestore = async () => {
    setBusy(true)
    try {
      const ok = await restore()
      if (ok) goBack('/settings')
    } finally {
      setBusy(false)
    }
  }

  return (
    <StyledPage flex={1} backgroundColor={C.bg} statusBarStyle={isDark ? 'light-content' : 'dark-content'}>
      <ScreenHeader title="NailBid Pro" onBackPress={() => goBack('/settings')} />

      <StyledScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Hero */}
        <Stack alignItems="center" gap={10} style={{ marginTop: 8, marginBottom: 24 }}>
          <Stack
            width={64} height={64} borderRadius={20}
            backgroundColor={C.primaryBg} alignItems="center" justifyContent="center"
          >
            <SparkleIcon size={28} strokeWidth={2} color={C.primary} />
          </Stack>
          <Text variant="title" color={C.textPrimary} fontWeight="800" textAlign="center">
            {isPremium ? "You're on NailBid Pro" : 'Go Pro'}
          </Text>
          <Text variant="body" color={C.textSecondary} textAlign="center" style={{ maxWidth: 280 }}>
            {isPremium
              ? `Thanks for supporting NailBid${plan ? ` · ${plan} plan` : ''}. Every quote and invoice now exports watermark-free.`
              : 'Remove the "Made with NailBid" watermark from every quote and invoice you export.'}
          </Text>
        </Stack>

        {__DEV__ && isPremium && (
          <StyledPressable
            onPress={async () => { setBusy(true); try { await resetForTesting() } finally { setBusy(false) } }}
            disabled={busy}
            style={{ alignSelf: 'center', marginBottom: 24 }}
            accessibilityRole="button" accessibilityLabel="Reset Pro status (dev only)"
          >
            <Text variant="caption" color={C.textMuted} textAlign="center">
              🛠 Dev: Reset Pro status (new anonymous identity)
            </Text>
          </StyledPressable>
        )}

        {!isPremium && (
          <>
            {/* Features */}
            <StyledCard
              backgroundColor={C.bgCard} borderRadius={16} padding={16} gap={14}
              borderWidth={1} borderColor={C.border}
              style={{ marginBottom: 20 }}
            >
              {PREMIUM_FEATURES.map((f) => (
                <Stack key={f.title} horizontal alignItems="flex-start" gap={12}>
                  <CheckCircleIcon size={18} strokeWidth={2} color={C.accepted} />
                  <Stack flex={1} gap={1}>
                    <Text variant="label" color={C.textPrimary} fontWeight="700">{f.title}</Text>
                    <Text variant="bodySmall" color={C.textSecondary}>{f.description}</Text>
                  </Stack>
                </Stack>
              ))}
            </StyledCard>

            {/* Plans */}
            <Stack gap={10} style={{ marginBottom: 20 }}>
              {PLANS.map((p) => {
                const isSelected = selected === p.key
                return (
                  <StyledPressable key={p.key} onPress={() => setSelected(p.key)}>
                    <StyledCard
                      backgroundColor={isSelected ? C.primaryBg : C.bgCard}
                      borderRadius={14} padding={14}
                      borderWidth={1.5} borderColor={isSelected ? C.primary : C.border}
                    >
                      <Stack horizontal alignItems="center" justifyContent="space-between">
                        <Stack horizontal alignItems="center" gap={10}>
                          <Stack
                            width={20} height={20} borderRadius={10}
                            borderWidth={2} borderColor={isSelected ? C.primary : C.border}
                            backgroundColor={isSelected ? C.primary : 'transparent'}
                            alignItems="center" justifyContent="center"
                          >
                            {isSelected && <Stack width={8} height={8} borderRadius={4} backgroundColor={C.white} />}
                          </Stack>
                          <Text variant="label" color={C.textPrimary} fontWeight="700">{p.label}</Text>
                          {p.saving && (
                            <Stack backgroundColor={C.acceptedBg} borderRadius={999} paddingHorizontal={8} paddingVertical={2}>
                              <Text variant="caption" color={C.accepted} fontWeight="700">{p.saving}</Text>
                            </Stack>
                          )}
                        </Stack>
                        <Stack alignItems="flex-end">
                          <Text variant="label" color={C.textPrimary} fontWeight="800">{p.price}</Text>
                          <Text variant="caption" color={C.textMuted}>{p.period}</Text>
                        </Stack>
                      </Stack>
                    </StyledCard>
                  </StyledPressable>
                )
              })}
            </Stack>

            <StyledButton
              block loading={busy}
              backgroundColor={C.primary}
              borderRadius={12} paddingVertical={14}
              onPress={handleContinue}
              style={{ marginBottom: 14 }}
            >
              <Text variant="button" color={C.white}>Continue</Text>
            </StyledButton>

            {selected === 'lifetime' && (
              <Text variant="caption" color={C.textMuted} textAlign="center" style={{ marginBottom: 14 }}>
                One-time purchase of {PLANS.find((p) => p.key === 'lifetime')!.price}. No subscription. Lifetime access forever.
              </Text>
            )}

            {/* Restore & legal */}
            <Stack alignItems="center" gap={8}>
              <StyledPressable
                onPress={handleRestore} disabled={busy}
                accessibilityRole="button" accessibilityLabel="Restore purchases"
              >
                <Text variant="bodySmall" color={C.primary} fontWeight="600">
                  Restore purchases
                </Text>
              </StyledPressable>

              <Text variant="caption" color={C.textMuted} textAlign="center">
                Payment will be charged to your Apple ID account at confirmation of purchase.
              </Text>

              <Stack horizontal alignItems="center" justifyContent="center" gap={10}>
                <StyledPressable
                  onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
                  accessibilityRole="link" accessibilityLabel="Privacy Policy" accessibilityHint="Opens in your browser"
                >
                  <Text variant="caption" color={C.primary}>Privacy Policy</Text>
                </StyledPressable>
                <Text variant="caption" color={C.textMuted}>·</Text>
                <StyledPressable
                  onPress={() => Linking.openURL(TERMS_URL)}
                  accessibilityRole="link" accessibilityLabel="Terms of Use" accessibilityHint="Opens in your browser"
                >
                  <Text variant="caption" color={C.primary}>Terms of Use</Text>
                </StyledPressable>
              </Stack>
            </Stack>
          </>
        )}
      </StyledScrollView>
    </StyledPage>
  )
}
