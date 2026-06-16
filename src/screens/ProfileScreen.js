import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, Card, Divider, Paragraph, Text, Title } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { CORES } from '../theme';

export default function ProfileScreen({
  carregandoPerfil,
  perfil,
  usuario,
  avatarUsuario,
  onOpenProfileForm,
  onDeleteProfile,
}) {
  if (carregandoPerfil) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  if (!perfil) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>Perfil ainda nao criado</Title>
          <Paragraph>Finalize seu perfil para continuar.</Paragraph>
          <Button
            mode="contained"
            onPress={() => onOpenProfileForm(false)}
            buttonColor={CORES.fundo}
            textColor="#FFFFFF"
          >
            Criar perfil
          </Button>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.linhaPerfil}>
          {avatarUsuario?.tipo === 'imagem' ? (
            <Avatar.Image size={76} source={{ uri: avatarUsuario.valor }} />
          ) : (
            <Avatar.Icon
              size={76}
              style={styles.avatarPadrao}
              icon={({ size, color }) => (
                <Ionicons
                  name={avatarUsuario?.valor || 'person-circle-outline'}
                  size={size}
                  color={color}
                />
              )}
            />
          )}
          <View style={styles.colunaPerfil}>
            <Title>{perfil.nome}</Title>
            <Paragraph>{perfil.email || usuario?.email}</Paragraph>
          </View>
        </View>
        <Divider style={styles.divider} />
        <Paragraph>Telefone: {perfil.telefone || 'Nao informado'}</Paragraph>
        <Paragraph>Cidade: {perfil.cidade || 'Nao informada'}</Paragraph>
        <View style={styles.rowButtons}>
          <Button
            mode="contained"
            icon="pencil"
            onPress={() => onOpenProfileForm(true)}
            style={styles.flexButton}
            buttonColor={CORES.fundo}
            textColor="#FFFFFF"
          >
            Editar
          </Button>
          <Button
            mode="contained"
            icon="delete"
            onPress={onDeleteProfile}
            style={styles.flexButton}
            buttonColor={CORES.fundo}
            textColor="#FFFFFF"
          >
            Excluir
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: { marginTop: 8, color: CORES.textoSecundario },
  linhaPerfil: { flexDirection: 'row', alignItems: 'center' },
  colunaPerfil: { marginLeft: 12, flex: 1 },
  avatarPadrao: { backgroundColor: '#E5E7EB' },
  divider: { marginVertical: 10 },
  rowButtons: { marginTop: 14, flexDirection: 'row', gap: 8 },
  flexButton: { flex: 1 },
});
