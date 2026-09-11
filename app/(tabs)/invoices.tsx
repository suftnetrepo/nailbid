import React, { useState } from "react";
import { Platform } from "react-native";
import { router } from "expo-router";
import {
  StyledPage,
  StyledScrollView,
  Stack,
  StyledCard,
  StyledPressable,
  TabBar,
  type TabItem,
  useDialogue,
} from "fluent-styles";
import { Text } from "../../src/components/Text";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { StatusBadge } from "../../src/components/StatusBadge";
import { EmptyState } from "../../src/components/EmptyState";
import { useColors, useIsDark, getStatusColors } from "../../src/constants";
import { useInvoices } from "../../src/hooks";
import { formatCurrency, formatShortDate } from "../../src/utils";
import type { Invoice } from "../../src/db/schema";

type StatusFilter = "all" | Invoice["status"];

const TABS: TabItem<StatusFilter>[] = [
  { value: "all", label: "All" },
  { value: "unpaid", label: "Unpaid" },
  { value: "overdue", label: "Overdue" },
  { value: "paid", label: "Paid" },
];

export default function InvoicesScreen() {
  const C = useColors();
  const isDark = useIsDark();
  const STATUS_COLORS = getStatusColors(C);
  const { data: invoices, loading, markPaid } = useInvoices();
  const dialogue = useDialogue();
  const [filter, setFilter] = useState<StatusFilter>("all");

  // Auto-flag overdue
  const enriched = invoices.map((inv) => ({
    ...inv,
    status:
      inv.status === "unpaid" && inv.dueDate < new Date()
        ? ("overdue" as const)
        : inv.status,
  }));

  const filtered =
    filter === "all" ? enriched : enriched.filter((i) => i.status === filter);

  const handleMarkPaid = async (id: string, number: string) => {
    const ok = await dialogue.confirm({
      title: `Mark ${number} as paid?`,
      message: "This will record the invoice as settled.",
      icon: "✅",
      confirmLabel: "Mark paid",
      cancelLabel: "Cancel",
    });
    if (ok) await markPaid(id);
  };

  return (
    <StyledPage
      flex={1}
      backgroundColor={C.bg}
      statusBarStyle={isDark ? "light-content" : "dark-content"}
      statusBarBackgroundColor={Platform.OS === "android" ? C.bg : undefined}
    >
      <ScreenHeader title="Invoices" variant="large" onBackPress={() => router.push('/(tabs)')} />

      <TabBar
        options={TABS}
        value={filter}
        onChange={setFilter}
        indicator="line"
        showBorder
        tabAlign="scroll"
        style={{ marginTop: 12, marginHorizontal: 16 }}
        colors={{
          background: C.bgCard,
          activeText: C.primary,
          indicator: C.primary,
          text: C.textSecondary,
          border: C.border,
        }}
      />

      <StyledScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {loading && (
          <Text
            variant="body"
            color={C.textMuted}
            textAlign="center"
            style={{ marginTop: 32 }}
          >
            Loading…
          </Text>
        )}

        {!loading && filtered.length === 0 && (
          <EmptyState
            emoji="🧾"
            title={filter === "all" ? "No invoices yet" : `No ${filter} invoices`}
            subtitle="Convert an accepted quote to create your first invoice"
          />
        )}

        {filtered.map((inv) => {
          const sc = STATUS_COLORS[inv.status];
          const isActionable =
            inv.status === "unpaid" || inv.status === "overdue";

          return (
            <StyledPressable
              key={inv.id}
              onPress={() => router.push(`/invoice/${inv.id}`)}
            >
              <StyledCard
                backgroundColor={C.bgCard}
                borderRadius={14}
                padding={14}
                marginBottom={10}
                borderLeftWidth={inv.status === "overdue" ? 3 : 0}
                borderLeftColor={C.overdue}
              >
                <Stack
                  horizontal
                  alignItems="flex-start"
                  justifyContent="space-between"
                >
                  <Stack flex={1} gap={2}>
                    <Stack horizontal alignItems="center" gap={8}>
                      <Text variant="label" color={C.textPrimary}>
                        {inv.customerName}
                      </Text>
                      <StatusBadge status={inv.status} colors={sc} />
                    </Stack>
                    <Text variant="bodySmall" color={C.textSecondary}>
                      Due {formatShortDate(inv.dueDate)}
                    </Text>
                    <Text variant="caption" color={C.textMuted}>
                      {inv.number}
                    </Text>
                  </Stack>

                  <Stack
                    alignItems="flex-end"
                    gap={6}
                    style={{ marginLeft: 12 }}
                  >
                    <Text
                      variant="label"
                      color={C.textPrimary}
                      fontWeight="700"
                    >
                      {formatCurrency(inv.total)}
                    </Text>
                    {isActionable && (
                      <StyledPressable
                        backgroundColor={C.paidBg}
                        borderRadius={8}
                        paddingHorizontal={10}
                        paddingVertical={4}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          handleMarkPaid(inv.id, inv.number);
                        }}
                      >
                        <Text variant="caption" color={C.paid} fontWeight="600">
                          Mark paid
                        </Text>
                      </StyledPressable>
                    )}
                  </Stack>
                </Stack>
              </StyledCard>
            </StyledPressable>
          );
        })}
      </StyledScrollView>
    </StyledPage>
  );
}
