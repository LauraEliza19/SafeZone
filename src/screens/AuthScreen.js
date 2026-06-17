import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Card, SegmentedButtons, TextInput } from 'react-native-paper';
import { CORES, segmentedTheme } from '../theme';

export default function AuthScreen({
  abaPublica,
  setAbaPublica,
  emailLogin,
  setEmailLogin,
  senhaLogin,
  setSenhaLogin,
  nomeCadastro,
  setNomeCadastro,
  emailCadastro,
  setEmailCadastro,
  senhaCadastro,
  setSenhaCadastro,
  confirmarSenha,
  setConfirmarSenha,
  ocultarSenhaLogin,
  setOcultarSenhaLogin,
  ocultarSenhaCadastro,
  setOcultarSenhaCadastro,
  ocultarConfirmacaoSenha,
  setOcultarConfirmacaoSenha,
  acaoEmAndamento,
  fazerLogin,
  cadastrarUsuario,
}) {
  return (
    <KeyboardAvoidingView
      style={styles.authKeyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
    >
      <ScrollView contentContainerStyle={styles.centralizado} keyboardShouldPersistTaps="handled">
        <Card style={styles.cardAuth}>
          <Card.Content>
            <Image source={require('../../assets/principal.png')} style={styles.authLogo} resizeMode="contain" />

            <SegmentedButtons
              value={abaPublica}
              onValueChange={setAbaPublica}
              theme={segmentedTheme}
              buttons={[
                {
                  value: 'login',
                  label: 'Entrar',
                  checkedColor: '#FFFFFF',
                  uncheckedColor: CORES.fundo,
                },
                {
                  value: 'cadastro',
                  label: 'Cadastrar',
                  checkedColor: '#FFFFFF',
                  uncheckedColor: CORES.fundo,
                },
              ]}
              style={styles.segmented}
            />

            {abaPublica === 'login' ? (
              <View>
                <TextInput
                  label="E-mail"
                  value={emailLogin}
                  onChangeText={setEmailLogin}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textColor={CORES.textoPrincipal}
                  cursorColor={CORES.secundaria}
                  selectionColor={CORES.secundaria}
                  mode="outlined"
                  outlineColor="transparent"
                  activeOutlineColor="transparent"
                  outlineStyle={styles.inputPillOutline}
                  style={styles.inputPill}
                  left={<TextInput.Icon icon="email" />}
                />
                <TextInput
                  key={`login-password-${ocultarSenhaLogin ? 'hidden' : 'visible'}`}
                  label="Senha"
                  value={senhaLogin}
                  onChangeText={setSenhaLogin}
                  secureTextEntry={ocultarSenhaLogin}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textColor={CORES.textoPrincipal}
                  cursorColor={CORES.secundaria}
                  selectionColor={CORES.secundaria}
                  mode="outlined"
                  outlineColor="transparent"
                  activeOutlineColor="transparent"
                  outlineStyle={styles.inputPillOutline}
                  style={styles.inputPill}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={ocultarSenhaLogin ? 'eye-off' : 'eye'}
                      onPress={() => setOcultarSenhaLogin((valorAtual) => !valorAtual)}
                    />
                  }
                />
                <Button
                  mode="contained"
                  icon="login"
                  loading={acaoEmAndamento}
                  disabled={acaoEmAndamento}
                  onPress={fazerLogin}
                  buttonColor={CORES.fundo}
                  textColor={CORES.primaria}
                >
                  Entrar
                </Button>
              </View>
            ) : (
              <View>
                <TextInput
                  label="Nome"
                  value={nomeCadastro}
                  onChangeText={setNomeCadastro}
                  textColor={CORES.textoPrincipal}
                  cursorColor={CORES.secundaria}
                  selectionColor={CORES.secundaria}
                  mode="outlined"
                  outlineColor="transparent"
                  activeOutlineColor="transparent"
                  outlineStyle={styles.inputPillOutline}
                  style={styles.inputPill}
                  left={<TextInput.Icon icon="account" />}
                />
                <TextInput
                  label="E-mail"
                  value={emailCadastro}
                  onChangeText={setEmailCadastro}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textColor={CORES.textoPrincipal}
                  cursorColor={CORES.secundaria}
                  selectionColor={CORES.secundaria}
                  mode="outlined"
                  outlineColor="transparent"
                  activeOutlineColor="transparent"
                  outlineStyle={styles.inputPillOutline}
                  style={styles.inputPill}
                  left={<TextInput.Icon icon="email" />}
                />
                <TextInput
                  key={`signup-password-${ocultarSenhaCadastro ? 'hidden' : 'visible'}`}
                  label="Senha"
                  value={senhaCadastro}
                  onChangeText={setSenhaCadastro}
                  secureTextEntry={ocultarSenhaCadastro}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textColor={CORES.textoPrincipal}
                  cursorColor={CORES.secundaria}
                  selectionColor={CORES.secundaria}
                  mode="outlined"
                  outlineColor="transparent"
                  activeOutlineColor="transparent"
                  outlineStyle={styles.inputPillOutline}
                  style={styles.inputPill}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={ocultarSenhaCadastro ? 'eye-off' : 'eye'}
                      onPress={() => setOcultarSenhaCadastro((valorAtual) => !valorAtual)}
                    />
                  }
                />
                <TextInput
                  key={`signup-confirm-password-${ocultarConfirmacaoSenha ? 'hidden' : 'visible'}`}
                  label="Confirmar senha"
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  secureTextEntry={ocultarConfirmacaoSenha}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textColor={CORES.textoPrincipal}
                  cursorColor={CORES.secundaria}
                  selectionColor={CORES.secundaria}
                  mode="outlined"
                  outlineColor="transparent"
                  activeOutlineColor="transparent"
                  outlineStyle={styles.inputPillOutline}
                  style={styles.inputPill}
                  left={<TextInput.Icon icon="lock-check" />}
                  right={
                    <TextInput.Icon
                      icon={ocultarConfirmacaoSenha ? 'eye-off' : 'eye'}
                      onPress={() => setOcultarConfirmacaoSenha((valorAtual) => !valorAtual)}
                    />
                  }
                />
                <Button
                  mode="contained"
                  icon="account-plus"
                  loading={acaoEmAndamento}
                  disabled={acaoEmAndamento}
                  onPress={cadastrarUsuario}
                  buttonColor={CORES.fundo}
                  textColor={CORES.primaria}
                >
                  Criar conta
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  authKeyboardContainer: { flex: 1 },
  centralizado: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  cardAuth: { borderRadius: 12, backgroundColor: CORES.primaria },
  authLogo: { width: '100%', height: 120, alignSelf: 'center', marginBottom: 10 },
  segmented: { marginBottom: 14, backgroundColor: '#FFFFFF', borderRadius: 999 },
  inputPill: {
    marginBottom: 12,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  inputPillOutline: { borderRadius: 28, borderWidth: 0 },
});
