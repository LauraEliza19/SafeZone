import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Appbar,
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  Modal,
  PaperProvider,
  Paragraph,
  Portal,
  SegmentedButtons,
  Text,
  TextInput,
  Title,
} from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA2O32NhLD6ihzFk1u96DraqNIk_8VwA0Q",
  authDomain: "safezone-d2c2f.firebaseapp.com",
  projectId: "safezone-d2c2f",
  storageBucket: "safezone-d2c2f.firebasestorage.app",
  messagingSenderId: "981904022626",
  appId: "1:981904022626:web:8013aef233563ac637053b"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const PERFIL_INICIAL = {
  nome: '',
  telefone: '',
  cidade: '',
  foto: '',
};

const OCORRENCIA_INICIAL = {
  id: null,
  tipo: '',
  descricao: '',
  local: '',
  risco: 'Medio',
  validadeHoras: '4',
};

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [carregandoAuth, setCarregandoAuth] = useState(true);
  const [abaPublica, setAbaPublica] = useState('login');
  const [abaPrivada, setAbaPrivada] = useState('perfil');
  const [acaoEmAndamento, setAcaoEmAndamento] = useState(false);

  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [nomeCadastro, setNomeCadastro] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [perfil, setPerfil] = useState(null);
  const [perfilForm, setPerfilForm] = useState(PERFIL_INICIAL);
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);
  const [modalPerfil, setModalPerfil] = useState(false);

  const [ocorrencias, setOcorrencias] = useState([]);
  const [carregandoOcorrencias, setCarregandoOcorrencias] = useState(false);
  const [modalOcorrencia, setModalOcorrencia] = useState(false);
  const [editandoOcorrencia, setEditandoOcorrencia] = useState(false);
  const [ocorrenciaAtual, setOcorrenciaAtual] = useState(OCORRENCIA_INICIAL);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCarregandoAuth(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!usuario) {
      setPerfil(null);
      setOcorrencias([]);
      setPerfilForm(PERFIL_INICIAL);
      return;
    }

    carregarPerfil();
    carregarOcorrencias();
  }, [usuario]);

  const avatarUsuario = useMemo(
    () =>
      perfil?.foto ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
    [perfil]
  );

  const validarEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const limparFormularioOcorrencia = () => {
    setOcorrenciaAtual(OCORRENCIA_INICIAL);
    setEditandoOcorrencia(false);
  };

  const fazerLogin = async () => {
    if (!validarEmail(emailLogin)) {
      Alert.alert('Erro', 'Informe um e-mail valido.');
      return;
    }
    if (!senhaLogin.trim()) {
      Alert.alert('Erro', 'Informe a senha.');
      return;
    }

    setAcaoEmAndamento(true);
    try {
      await signInWithEmailAndPassword(auth, emailLogin.trim(), senhaLogin);
      setAbaPrivada('perfil');
    } catch (error) {
      Alert.alert('Falha no login', error.message);
    } finally {
      setAcaoEmAndamento(false);
    }
  };

  const cadastrarUsuario = async () => {
    if (!nomeCadastro.trim()) {
      Alert.alert('Erro', 'Informe seu nome.');
      return;
    }
    if (!validarEmail(emailCadastro)) {
      Alert.alert('Erro', 'Informe um e-mail valido.');
      return;
    }
    if (senhaCadastro.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senhaCadastro !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas nao conferem.');
      return;
    }

    setAcaoEmAndamento(true);
    try {
      const credencial = await createUserWithEmailAndPassword(
        auth,
        emailCadastro.trim(),
        senhaCadastro
      );

      await setDoc(doc(db, 'usuarios', credencial.user.uid), {
        nome: nomeCadastro.trim(),
        email: emailCadastro.trim(),
        telefone: '',
        cidade: '',
        foto: '',
        criadoEm: serverTimestamp(),
      });

      setEmailLogin(emailCadastro.trim());
      setSenhaLogin(senhaCadastro);
      setNomeCadastro('');
      setEmailCadastro('');
      setSenhaCadastro('');
      setConfirmarSenha('');
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
    } catch (error) {
      Alert.alert('Falha no cadastro', error.message);
    } finally {
      setAcaoEmAndamento(false);
    }
  };

  const sair = async () => {
    try {
      await signOut(auth);
      setAbaPublica('login');
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const carregarPerfil = async () => {
    if (!usuario) return;

    setCarregandoPerfil(true);
    try {
      const perfilRef = doc(db, 'usuarios', usuario.uid);
      const perfilSnapshot = await getDoc(perfilRef);
      if (perfilSnapshot.exists()) {
        const dados = perfilSnapshot.data();
        setPerfil(dados);
        setPerfilForm({
          nome: dados.nome || '',
          telefone: dados.telefone || '',
          cidade: dados.cidade || '',
          foto: dados.foto || '',
        });
      } else {
        setPerfil(null);
        setPerfilForm({
          nome: '',
          telefone: '',
          cidade: '',
          foto: '',
        });
      }
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel carregar o perfil: ' + error.message);
    } finally {
      setCarregandoPerfil(false);
    }
  };

  const criarPerfil = async () => {
    if (!usuario) return;
    if (!perfilForm.nome.trim()) {
      Alert.alert('Erro', 'Informe o nome para criar o perfil.');
      return;
    }

    setAcaoEmAndamento(true);
    try {
      await setDoc(
        doc(db, 'usuarios', usuario.uid),
        {
          nome: perfilForm.nome.trim(),
          email: usuario.email,
          telefone: perfilForm.telefone.trim(),
          cidade: perfilForm.cidade.trim(),
          foto: perfilForm.foto.trim(),
          criadoEm: serverTimestamp(),
        },
        { merge: true }
      );
      await carregarPerfil();
      Alert.alert('Sucesso', 'Perfil criado com sucesso.');
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel criar o perfil: ' + error.message);
    } finally {
      setAcaoEmAndamento(false);
    }
  };

  const atualizarPerfil = async () => {
    if (!usuario) return;
    if (!perfilForm.nome.trim()) {
      Alert.alert('Erro', 'Informe seu nome.');
      return;
    }

    setAcaoEmAndamento(true);
    try {
      await updateDoc(doc(db, 'usuarios', usuario.uid), {
        nome: perfilForm.nome.trim(),
        telefone: perfilForm.telefone.trim(),
        cidade: perfilForm.cidade.trim(),
        foto: perfilForm.foto.trim(),
        atualizadoEm: serverTimestamp(),
      });
      await carregarPerfil();
      setModalPerfil(false);
      Alert.alert('Sucesso', 'Perfil atualizado.');
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel atualizar o perfil: ' + error.message);
    } finally {
      setAcaoEmAndamento(false);
    }
  };

  const excluirPerfil = () => {
    Alert.alert(
      'Excluir perfil',
      'Esta acao remove seu perfil e conta de autenticacao. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            if (!usuario) return;
            setAcaoEmAndamento(true);
            try {
              await deleteDoc(doc(db, 'usuarios', usuario.uid));
              await deleteUser(usuario);
              Alert.alert('Conta removida', 'Seu perfil foi excluido com sucesso.');
            } catch (error) {
              Alert.alert(
                'Erro',
                'Nao foi possivel excluir. Faça login novamente e tente: ' + error.message
              );
            } finally {
              setAcaoEmAndamento(false);
            }
          },
        },
      ]
    );
  };

  const carregarOcorrencias = async () => {
    if (!usuario) return;
    setCarregandoOcorrencias(true);
    try {
      const ocorrenciasQuery = query(
        collection(db, 'ocorrencias'),
        where('uid', '==', usuario.uid)
      );
      const snapshot = await getDocs(ocorrenciasQuery);

      const dados = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      dados.sort((a, b) => {
        const tA = a.criadoEm?.seconds || 0;
        const tB = b.criadoEm?.seconds || 0;
        return tB - tA;
      });
      setOcorrencias(dados);
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel carregar ocorrencias: ' + error.message);
    } finally {
      setCarregandoOcorrencias(false);
    }
  };

  const validarOcorrencia = () => {
    if (!ocorrenciaAtual.tipo.trim()) {
      Alert.alert('Erro', 'Informe o tipo de perigo.');
      return false;
    }
    if (!ocorrenciaAtual.descricao.trim()) {
      Alert.alert('Erro', 'Informe a descricao.');
      return false;
    }
    if (!ocorrenciaAtual.local.trim()) {
      Alert.alert('Erro', 'Informe o local.');
      return false;
    }
    if (!Number(ocorrenciaAtual.validadeHoras) || Number(ocorrenciaAtual.validadeHoras) <= 0) {
      Alert.alert('Erro', 'Informe validade em horas (numero maior que zero).');
      return false;
    }
    return true;
  };

  const salvarOcorrencia = async () => {
    if (!usuario || !validarOcorrencia()) return;

    setAcaoEmAndamento(true);
    try {
      const payload = {
        uid: usuario.uid,
        tipo: ocorrenciaAtual.tipo.trim(),
        descricao: ocorrenciaAtual.descricao.trim(),
        local: ocorrenciaAtual.local.trim(),
        risco: ocorrenciaAtual.risco,
        validadeHoras: Number(ocorrenciaAtual.validadeHoras),
        expiraEm: new Date(
          Date.now() + Number(ocorrenciaAtual.validadeHoras) * 60 * 60 * 1000
        ),
      };

      if (editandoOcorrencia) {
        await updateDoc(doc(db, 'ocorrencias', ocorrenciaAtual.id), {
          ...payload,
          atualizadoEm: serverTimestamp(),
        });
        Alert.alert('Sucesso', 'Ocorrencia atualizada.');
      } else {
        await addDoc(collection(db, 'ocorrencias'), {
          ...payload,
          criadoEm: serverTimestamp(),
        });
        Alert.alert('Sucesso', 'Ocorrencia cadastrada.');
      }

      setModalOcorrencia(false);
      limparFormularioOcorrencia();
      carregarOcorrencias();
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel salvar a ocorrencia: ' + error.message);
    } finally {
      setAcaoEmAndamento(false);
    }
  };

  const editarOcorrencia = (item) => {
    setOcorrenciaAtual({
      id: item.id,
      tipo: item.tipo || '',
      descricao: item.descricao || '',
      local: item.local || '',
      risco: item.risco || 'Medio',
      validadeHoras: String(item.validadeHoras || '4'),
    });
    setEditandoOcorrencia(true);
    setModalOcorrencia(true);
  };

  const excluirOcorrencia = (item) => {
    Alert.alert('Excluir ocorrencia', `Deseja excluir "${item.tipo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setAcaoEmAndamento(true);
          try {
            await deleteDoc(doc(db, 'ocorrencias', item.id));
            await carregarOcorrencias();
            Alert.alert('Sucesso', 'Ocorrencia excluida.');
          } catch (error) {
            Alert.alert('Erro', 'Nao foi possivel excluir: ' + error.message);
          } finally {
            setAcaoEmAndamento(false);
          }
        },
      },
    ]);
  };

  const abrirNovaOcorrencia = () => {
    limparFormularioOcorrencia();
    setModalOcorrencia(true);
  };

  const renderTelaPublica = () => (
    <ScrollView contentContainerStyle={styles.centralizado}>
      <Card style={styles.cardAuth}>
        <Card.Content>
          <Title style={styles.titulo}>SafeZone</Title>
          <Paragraph style={styles.subtitulo}>
            Seguranca colaborativa com alertas em tempo real.
          </Paragraph>

          <SegmentedButtons
            value={abaPublica}
            onValueChange={setAbaPublica}
            buttons={[
              { value: 'login', label: 'Entrar' },
              { value: 'cadastro', label: 'Cadastrar' },
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
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />
              <TextInput
                label="Senha"
                value={senhaLogin}
                onChangeText={setSenhaLogin}
                secureTextEntry
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
              />
              <Button
                mode="contained"
                icon="login"
                loading={acaoEmAndamento}
                disabled={acaoEmAndamento}
                onPress={fazerLogin}
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
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
              />
              <TextInput
                label="E-mail"
                value={emailCadastro}
                onChangeText={setEmailCadastro}
                autoCapitalize="none"
                keyboardType="email-address"
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />
              <TextInput
                label="Senha"
                value={senhaCadastro}
                onChangeText={setSenhaCadastro}
                secureTextEntry
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
              />
              <TextInput
                label="Confirmar senha"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="lock-check" />}
              />
              <Button
                mode="contained"
                icon="account-plus"
                loading={acaoEmAndamento}
                disabled={acaoEmAndamento}
                onPress={cadastrarUsuario}
              >
                Criar conta
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderPerfil = () => {
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
            <Title>Crie seu perfil</Title>
            <Paragraph>
              O cadastro da conta foi criado, agora finalize seu perfil com os dados abaixo.
            </Paragraph>
            <TextInput
              label="Nome"
              value={perfilForm.nome}
              onChangeText={(text) => setPerfilForm({ ...perfilForm, nome: text })}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Telefone"
              value={perfilForm.telefone}
              onChangeText={(text) => setPerfilForm({ ...perfilForm, telefone: text })}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Cidade"
              value={perfilForm.cidade}
              onChangeText={(text) => setPerfilForm({ ...perfilForm, cidade: text })}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="URL da foto"
              value={perfilForm.foto}
              onChangeText={(text) => setPerfilForm({ ...perfilForm, foto: text })}
              mode="outlined"
              style={styles.input}
            />
            <Button
              mode="contained"
              icon="content-save"
              onPress={criarPerfil}
              loading={acaoEmAndamento}
              disabled={acaoEmAndamento}
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
            <Avatar.Image size={76} source={{ uri: avatarUsuario }} />
            <View style={styles.colunaPerfil}>
              <Title>{perfil.nome}</Title>
              <Paragraph>{perfil.email || usuario.email}</Paragraph>
            </View>
          </View>
          <Divider style={styles.divider} />
          <Paragraph>Telefone: {perfil.telefone || 'Nao informado'}</Paragraph>
          <Paragraph>Cidade: {perfil.cidade || 'Nao informada'}</Paragraph>
          <View style={styles.rowButtons}>
            <Button
              mode="outlined"
              icon="pencil"
              onPress={() => setModalPerfil(true)}
              style={styles.flexButton}
            >
              Editar
            </Button>
            <Button
              mode="contained"
              buttonColor="#c62828"
              icon="delete"
              onPress={excluirPerfil}
              style={styles.flexButton}
            >
              Excluir
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderOcorrencias = () => (
    <View style={styles.fullHeight}>
      <View style={styles.headerLista}>
        <Title>Ocorrencias</Title>
        <Button mode="contained" icon="plus" onPress={abrirNovaOcorrencia}>
          Nova
        </Button>
      </View>
      {carregandoOcorrencias ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Carregando ocorrencias...</Text>
        </View>
      ) : ocorrencias.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Nenhuma ocorrencia cadastrada</Title>
            <Paragraph>Toque em "Nova" para cadastrar um risco.</Paragraph>
          </Card.Content>
        </Card>
      ) : (
        <ScrollView>
          {ocorrencias.map((item) => (
            <Card key={item.id} style={styles.card}>
              <Card.Content>
                <View style={styles.linhaEntre}>
                  <Title>{item.tipo}</Title>
                  <Chip>{item.risco}</Chip>
                </View>
                <Paragraph>{item.descricao}</Paragraph>
                <Paragraph>Local: {item.local}</Paragraph>
                <Paragraph>Validade: {item.validadeHoras}h</Paragraph>
                <View style={styles.rowButtons}>
                  <Button
                    mode="outlined"
                    icon="pencil"
                    onPress={() => editarOcorrencia(item)}
                    style={styles.flexButton}
                  >
                    Editar
                  </Button>
                  <Button
                    mode="contained"
                    buttonColor="#c62828"
                    icon="delete"
                    onPress={() => excluirOcorrencia(item)}
                    style={styles.flexButton}
                  >
                    Excluir
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );

  if (carregandoAuth) {
    return (
      <PaperProvider>
        <SafeAreaProvider>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Validando sessao...</Text>
          </View>
        </SafeAreaProvider>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <Appbar.Header>
            <Appbar.Content
              title={usuario ? 'SafeZone - Area Logada' : 'SafeZone - Autenticacao'}
              subtitle={usuario ? usuario.email : 'Acesse ou cadastre sua conta'}
            />
            {usuario ? (
              <>
                <Appbar.Action icon="refresh" onPress={abaPrivada === 'perfil' ? carregarPerfil : carregarOcorrencias} />
                <Appbar.Action icon="logout" onPress={sair} />
              </>
            ) : null}
          </Appbar.Header>

          {!usuario ? (
            renderTelaPublica()
          ) : (
            <View style={styles.areaPrivada}>
              <SegmentedButtons
                value={abaPrivada}
                onValueChange={setAbaPrivada}
                buttons={[
                  { value: 'perfil', label: 'Perfil (CRUD)' },
                  { value: 'ocorrencias', label: 'Ocorrencias (CRUD)' },
                ]}
                style={styles.segmented}
              />
              <View style={styles.conteudoPrivado}>
                {abaPrivada === 'perfil' ? renderPerfil() : renderOcorrencias()}
              </View>
            </View>
          )}

          <Portal>
            <Modal
              visible={modalPerfil}
              onDismiss={() => setModalPerfil(false)}
              contentContainerStyle={styles.modal}
            >
              <Card>
                <Card.Content>
                  <Title>Editar perfil</Title>
                  <TextInput
                    label="Nome"
                    value={perfilForm.nome}
                    onChangeText={(text) => setPerfilForm({ ...perfilForm, nome: text })}
                    mode="outlined"
                    style={styles.input}
                  />
                  <TextInput
                    label="Telefone"
                    value={perfilForm.telefone}
                    onChangeText={(text) => setPerfilForm({ ...perfilForm, telefone: text })}
                    mode="outlined"
                    style={styles.input}
                  />
                  <TextInput
                    label="Cidade"
                    value={perfilForm.cidade}
                    onChangeText={(text) => setPerfilForm({ ...perfilForm, cidade: text })}
                    mode="outlined"
                    style={styles.input}
                  />
                  <TextInput
                    label="URL da foto"
                    value={perfilForm.foto}
                    onChangeText={(text) => setPerfilForm({ ...perfilForm, foto: text })}
                    mode="outlined"
                    style={styles.input}
                  />
                  <View style={styles.rowButtons}>
                    <Button
                      mode="outlined"
                      onPress={() => setModalPerfil(false)}
                      style={styles.flexButton}
                    >
                      Cancelar
                    </Button>
                    <Button
                      mode="contained"
                      icon="check"
                      onPress={atualizarPerfil}
                      style={styles.flexButton}
                    >
                      Salvar
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            </Modal>
          </Portal>

          <Portal>
            <Modal
              visible={modalOcorrencia}
              onDismiss={() => setModalOcorrencia(false)}
              contentContainerStyle={styles.modal}
            >
              <Card>
                <Card.Content>
                  <Title>{editandoOcorrencia ? 'Editar ocorrencia' : 'Nova ocorrencia'}</Title>
                  <TextInput
                    label="Tipo de perigo"
                    value={ocorrenciaAtual.tipo}
                    onChangeText={(text) =>
                      setOcorrenciaAtual({ ...ocorrenciaAtual, tipo: text })
                    }
                    mode="outlined"
                    style={styles.input}
                  />
                  <TextInput
                    label="Descricao"
                    value={ocorrenciaAtual.descricao}
                    onChangeText={(text) =>
                      setOcorrenciaAtual({ ...ocorrenciaAtual, descricao: text })
                    }
                    mode="outlined"
                    style={styles.input}
                    multiline
                  />
                  <TextInput
                    label="Local"
                    value={ocorrenciaAtual.local}
                    onChangeText={(text) =>
                      setOcorrenciaAtual({ ...ocorrenciaAtual, local: text })
                    }
                    mode="outlined"
                    style={styles.input}
                  />
                  <TextInput
                    label="Risco (Baixo, Medio, Alto)"
                    value={ocorrenciaAtual.risco}
                    onChangeText={(text) =>
                      setOcorrenciaAtual({ ...ocorrenciaAtual, risco: text })
                    }
                    mode="outlined"
                    style={styles.input}
                  />
                  <TextInput
                    label="Validade em horas"
                    value={ocorrenciaAtual.validadeHoras}
                    onChangeText={(text) =>
                      setOcorrenciaAtual({ ...ocorrenciaAtual, validadeHoras: text })
                    }
                    mode="outlined"
                    style={styles.input}
                    keyboardType="numeric"
                  />
                  <View style={styles.rowButtons}>
                    <Button
                      mode="outlined"
                      onPress={() => setModalOcorrencia(false)}
                      style={styles.flexButton}
                    >
                      Cancelar
                    </Button>
                    <Button
                      mode="contained"
                      icon={editandoOcorrencia ? 'check' : 'plus'}
                      onPress={salvarOcorrencia}
                      style={styles.flexButton}
                    >
                      {editandoOcorrencia ? 'Atualizar' : 'Salvar'}
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            </Modal>
          </Portal>
        </View>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
  },
  areaPrivada: {
    flex: 1,
    padding: 12,
  },
  conteudoPrivado: {
    flex: 1,
    marginTop: 10,
  },
  fullHeight: {
    flex: 1,
  },
  centralizado: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  cardAuth: {
    borderRadius: 12,
  },
  card: {
    marginBottom: 10,
  },
  titulo: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    textAlign: 'center',
    marginBottom: 14,
  },
  segmented: {
    marginBottom: 14,
  },
  input: {
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 8,
  },
  linhaPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colunaPerfil: {
    marginLeft: 12,
    flex: 1,
  },
  divider: {
    marginVertical: 10,
  },
  rowButtons: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  flexButton: {
    flex: 1,
  },
  modal: {
    margin: 16,
  },
  headerLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  linhaEntre: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
});
