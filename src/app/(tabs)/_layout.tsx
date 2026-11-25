import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';
import type { ColorValue } from 'react-native';
import type { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color, focused }: { name: IoniconName; color: ColorValue; focused: boolean }) {
  const { colors } = useTheme();
  return (
    <Ionicons
      name={name}
      size={21}
      color={typeof color === 'number' || !color ? colors.text : color}
      style={{ opacity: focused ? 1 : 0.55 }}
    />
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.sub,
        tabBarStyle: {
          backgroundColor: colors.bgSoft,
          borderTopColor: colors.border,
        },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="folder-open" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="formulaires"
        options={{
          title: 'Formulaires',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="document-text" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="habitudes"
        options={{
          title: 'Habitudes',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="pulse" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reglages"
        options={{
          title: 'Réglages',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="settings" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
