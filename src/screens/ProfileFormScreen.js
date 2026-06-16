import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Paragraph, TextInput, Title } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { CORES } from '../theme';

const AVATARES_DISPONIVEIS = [
  'person-circle-outline',
  'happy-outline',
  'shield-checkmark-outline',
  'star-outline',
  'leaf-outline',
  'planet-outline',
];

export default function ProfileFormScreen({
  perfilForm,
  setPerfilForm,
  onCancel,
  onSubmit,
  editando,
}) {
  const avatarSelecionado = (perfilForm.foto || '').replace('icon:', '') || 'person-circle-outline';

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Card.Content>
          <Title style={styles.title}>{editando ? 'Editar perfil' : 'Criar perfil'}</Title>
          <TextInput
            label="Nome"
            value={perfilForm.nome}
            onChangeText={(text) => setPerfilForm({ ...perfilForm, nome: text })}
            mode="outlined"
            outlineColor="transparent"
            activeOutlineColor="transparent"
            outlineStyle={styles.inputPillOutline}
            style={styles.inputPill}
            textColor={CORES.textoPrincipal}
            cursorColor={CORES.secundaria}
            selectionColor={CORES.secundaria}
          />
          <TextInput
            label="Telefone"
            value={perfilForm.telefone}
            onChangeText={(text) => setPerfilForm({ ...perfilForm, telefone: text })}
            mode="outlined"
            outlineColor="transparent"
            activeOutlineColor="transparent"
            outlineStyle={styles.inputPillOutline}
            style={styles.inputPill}
            textColor={CORES.textoPrincipal}
            cursorColor={CORES.secundaria}
            selectionColor={CORES.secundaria}
          />
          <TextInput
            label="Cidade"
            value={perfilForm.cidade}
            onChangeText={(text) => setPerfilForm({ ...perfilForm, cidade: text })}
            mode="outlined"
            outlineColor="transparent"
            activeOutlineColor="transparent"
            outlineStyle={styles.inputPillOutline}
            style={styles.inputPill}
            textColor={CORES.textoPrincipal}
            cursorColor={CORES.secundaria}
            selectionColor={CORES.secundaria}
          />

          <View style={styles.uploadPreviewContainer}>
            <Avatar.Icon
              size={86}
              style={styles.avatarPadrao}
              icon={({ size, color }) => <Ionicons name={avatarSelecionado} size={size} color={color} />}
            />
            <Paragraph style={styles.uploadPreviewText}>Selecione um avatar</Paragraph>
          </View>

          <View style={styles.avatarGrid}>
            {AVATARES_DISPONIVEIS.map((icone) => {
              const ativo = avatarSelecionado === icone;
              return (
                <Pressable
                  key={icone}
                  onPress={() => setPerfilForm({ ...perfilForm, foto: `icon:${icone}` })}
                  style={[styles.avatarOption, ativo && styles.avatarOptionAtivo]}
                >
                  <Ionicons name={icone} size={28} color={ativo ? '#FFFFFF' : CORES.fundo} />
                </Pressable>
              );
            })}
          </View>

          <View style={styles.rowButtons}>
            <Button
              mode="contained"
              onPress={onCancel}
              style={styles.flexButton}
              buttonColor={CORES.fundo}
              textColor="#FFFFFF"
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              icon="check"
              onPress={onSubmit}
              style={styles.flexButton}
              buttonColor={CORES.fundo}
              textColor="#FFFFFF"
            >
              Salvar
            </Button>
          </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CORES.fundo,
    padding: 8,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  card: {
    flex: 1,
    minHeight: '95%',
    borderRadius: 18,
  },
  title: { marginBottom: 10 },
  inputPill: {
    marginBottom: 12,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  inputPillOutline: { borderRadius: 28, borderWidth: 0 },
  uploadPreviewContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadPreviewText: {
    marginTop: 6,
    color: CORES.textoSecundario,
    fontSize: 12,
  },
  avatarPadrao: { backgroundColor: '#E5E7EB' },
  avatarGrid: {
    marginBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  avatarOption: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  avatarOptionAtivo: {
    backgroundColor: CORES.secundaria,
    borderColor: CORES.secundaria,
  },
  rowButtons: { marginTop: 14, flexDirection: 'row', gap: 8 },
  flexButton: { flex: 1 },
});
