import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Fonts, Type, Shadows } from '../../theme/theme';

interface SupportContact {
  id: string;
  name: string;
  role: string;
  initials: string;
  hasPhone: boolean;
  hasMessage: boolean;
  hasEmail: boolean;
  isOnline?: boolean;
}

interface ContactSupportPersonCardProps {
  contacts: SupportContact[];
  onCall: (id: string) => void;
  onMessage: (id: string) => void;
  onEmail: (id: string) => void;
  onAddContact: () => void;
  onViewAll: () => void;
}

function ActionBtn({
  icon,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.75}>
      <Ionicons name={icon} size={14} color={Colors.purple} />
    </TouchableOpacity>
  );
}

export default function ContactSupportPersonCard({
  contacts,
  onCall,
  onMessage,
  onEmail,
  onAddContact,
  onViewAll,
}: ContactSupportPersonCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contact my support person</Text>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.headerLink}>View all →</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Reach out to someone you trust.</Text>

      {contacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No contacts added yet</Text>
          <Text style={styles.emptyText}>Add someone you trust so they are easy to reach.</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={onAddContact} activeOpacity={0.75}>
            <Text style={styles.emptyButtonText}>+ Add contact</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scroll}
        >
          {contacts.map((contact) => (
            <View key={contact.id} style={styles.contactCol}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatar}>
                  <Text style={styles.initials}>{contact.initials}</Text>
                </View>
                {contact.isOnline && <View style={styles.onlineDot} />}
              </View>

              <Text style={styles.contactName} numberOfLines={1}>{contact.name}</Text>
              <Text style={styles.contactRole} numberOfLines={1}>{contact.role}</Text>

              <View style={styles.actionRow}>
                {contact.hasPhone && (
                  <ActionBtn icon="call-outline" onPress={() => onCall(contact.id)} />
                )}
                {contact.hasMessage && (
                  <ActionBtn icon="chatbubble-outline" onPress={() => onMessage(contact.id)} />
                )}
                {contact.hasEmail && (
                  <ActionBtn icon="mail-outline" onPress={() => onEmail(contact.id)} />
                )}
              </View>
            </View>
          ))}

          <View style={styles.contactCol}>
            <TouchableOpacity style={styles.addCircle} onPress={onAddContact} activeOpacity={0.75}>
              <Text style={styles.addPlus}>+</Text>
            </TouchableOpacity>
            <Text style={styles.contactName} numberOfLines={1}> </Text>
            <Text style={styles.addLabel}>Add Contact</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...Type.cardTitle,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  headerLink: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.purple,
    flexShrink: 0,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },
  scroll: {
    marginTop: 12,
  },
  scrollContent: {
    gap: 12,
    paddingRight: 4,
  },
  emptyState: {
    backgroundColor: Colors.navActiveBg,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  emptyButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.cardBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
  },
  emptyButtonText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.purple,
  },
  contactCol: {
    width: 72,
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    width: 52,
    height: 52,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.navActiveBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.purple,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.green,
    borderWidth: 1.5,
    borderColor: Colors.cardBg,
  },
  contactName: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 6,
  },
  contactRole: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    justifyContent: 'center',
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.navActiveBg,
    borderWidth: 0.5,
    borderColor: '#D0B8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: Colors.grayLavender,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPlus: {
    fontSize: 20,
    fontFamily: Fonts.regular,
    color: Colors.grayLavender,
    lineHeight: 24,
  },
  addLabel: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});
