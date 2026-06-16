import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Paragraph, TextInput, Title } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { CORES } from '../theme';

export default function ProfileFormScreen({
  perfilForm,
  setPerfilForm,
  enviandoFoto,
  onUploadFoto,
  onCancel,
  onSubmit,
  editando,
}) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Card.Content>
          <Title style={styles.title}>{editando ? 'Editar perfil' : 'Novo perfil'}</Title>
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
            {perfilForm.foto ? (
              <Avatar.Image size={86} source={{ uri: perfilForm.foto }} />
            ) : (
              <Avatar.Icon
                size={86}
                style={styles.avatarPadrao}
                icon={({ size, color }) => (
                  <Ionicons name="person-circle-outline" size={size} color={color} />
                )}
              />
            )}
            <Paragraph style={styles.uploadPreviewText}>Preview da foto</Paragraph>
          </View>

          <Button
            mode="contained"
            icon="image-plus"
            onPress={onUploadFoto}
            loading={enviandoFoto}
            disabled={enviandoFoto}
            style={styles.uploadButton}
            buttonColor={CORES.fundo}
            textColor="#FFFFFF"
          >
            Upload de foto
          </Button>

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
  uploadButton: { marginBottom: 12 },
  rowButtons: { marginTop: 14, flexDirection: 'row', gap: 8 },
  flexButton: { flex: 1 },
});
