import React from 'react'
import { Tabs } from 'expo-router'
import { useColors } from '../../src/constants'
import { HomeIcon, UsersIcon, DocumentIcon, ReceiptIcon } from '../../src/icons'

export default function TabsLayout() {
  const C = useColors()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   C.primary,
        tabBarInactiveTintColor: C.textMuted,
        tabBarStyle: {
          backgroundColor: C.bgCard,
          borderTopColor:  C.border,
          borderTopWidth:  0.5,
          height:          60,
          paddingBottom:   8,
          paddingTop:      6,
        },
        tabBarLabelStyle: {
          fontFamily: 'PlusJakartaSans_600SemiBold',
          fontSize:   10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title:    'Home',
          tabBarIcon: ({ color }) => <HomeIcon size={22} strokeWidth={2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title:    'Customers',
          tabBarIcon: ({ color }) => <UsersIcon size={22} strokeWidth={2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="quotes"
        options={{
          title:    'Quotes',
          tabBarIcon: ({ color }) => <DocumentIcon size={22} strokeWidth={2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title:    'Invoices',
          tabBarIcon: ({ color }) => <ReceiptIcon size={22} strokeWidth={2} color={color} />,
        }}
      />
    </Tabs>
  )
}
