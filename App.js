import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Appbar, PaperProvider, Portal } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import {
  createUserWithEmailAndPassword,
  deleteUser,
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
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import AuthScreen from './src/screens/AuthScreen';
import HomeMapScreen from './src/screens/HomeMapScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProfileFormScreen from './src/screens/ProfileFormScreen';
import OccurrencesListScreen from './src/screens/OccurrencesListScreen';
import OccurrenceFormScreen from './src/screens/OccurrenceFormScreen';
import { auth, db } from './src/firebase';
import { OCORRENCIA_INICIAL, PERFIL_INICIAL, REGIAO_PADRAO, TIPOS_PERIGO } from './src/constants';
import { CORES, tema } from './src/theme';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [carregandoAuth, setCarregandoAuth] = useState(true);
  const [abaPublica, setAbaPublica] = useState('login');
  const [telaPrivada, setTelaPrivada] = useState('mapa');
  const [menuVisible, setMenuVisible] = useState(false);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState(false);

  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [nomeCadastro, setNomeCadastro] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [ocultarSenhaLogin, setOcultarSenhaLogin] = useState(true);
  const [ocultarSenhaCadastro, setOcultarSenhaCadastro] = useState(true);
  const [ocultarConfirmacaoSenha, setOcultarConfirmacaoSenha] = useState(true);

  const [perfil, setPerfil] = useState(null);
  const [perfilForm, setPerfilForm] = useState(PERFIL_INICIAL);
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);
  const [editandoPerfil, setEditandoPerfil] = useState(false);

  const [ocorrencias, setOcorrencias] = useState([]);
  const [carregandoOcorrencias, setCarregandoOcorrencias] = useState(false);
  const [carregandoMapa, setCarregandoMapa] = useState(false);
  const [ocorrenciasProximas, setOcorrenciasProximas] = useState([]);
  const [localAtual, setLocalAtual] = useState(null);
  const [editandoOcorrencia, setEditandoOcorrencia] = useState(false);
  const [ocorrenciaAtual, setOcorrenciaAtual] = useState(OCORRENCIA_INICIAL);
  const [regiaoMapa, setRegiaoMapa] = useState(REGIAO_PADRAO);

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
      setTelaPrivada('mapa');
      setOcorrenciasProximas([]);
      setLocalAtual(null);
      return;
    }
    carregarPerfil();
    carregarOcorrencias();
    carregarMapaPrincipal();
  }, [usuario]);

  const avatarUsuario = useMemo(() => {
    const foto = perfil?.foto?.trim() || '';
    if (foto.startsWith('icon:')) {
      return { tipo: 'icone', valor: foto.replace('icon:', '') || 'person-circle-outline' };
    }
    if (foto) {
      return { tipo: 'imagem', valor: foto };
    }
    return { tipo: 'icone', valor: 'person-circle-outline' };
  }, [perfil]);
  const validarEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const calcularDistanciaKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (valor) => (valor * Math.PI) / 180;
    const raioTerra = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return raioTerra * c;
  };

  const fazerLogin = async () => {
    if (!validarEmail(emailLogin) || !senhaLogin.trim()) {
      Alert.alert('Erro', 'Informe e-mail valido e senha.');
      return;
    }
    setAcaoEmAndamento(true);
    try {
      await signInWithEmailAndPassword(auth, emailLogin.trim(), senhaLogin);
      setTelaPrivada('mapa');
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
    if (senhaCadastro.length < 6 || senhaCadastro !== confirmarSenha) {
      Alert.alert('Erro', 'Verifique senha e confirmacao.');
      return;
    }
    setAcaoEmAndamento(true);
    try {
      const credencial = await createUserWithEmailAndPassword(auth, emailCadastro.trim(), senhaCadastro);
      await setDoc(doc(db, 'usuarios', credencial.user.uid), {
        nome: nomeCadastro.trim(),
        email: emailCadastro.trim(),
        telefone: '',
        cidade: '',
        foto: 'icon:person-circle-outline',
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
      const perfilSnapshot = await getDoc(doc(db, 'usuarios', usuario.uid));
      if (perfilSnapshot.exists()) {
        const dados = perfilSnapshot.data();
        setPerfil(dados);
        setPerfilForm({
          nome: dados.nome || '',
          telefone: dados.telefone || '',
          cidade: dados.cidade || '',
          foto: dados.foto || 'icon:person-circle-outline',
        });
      } else {
        setPerfil(null);
        setPerfilForm(PERFIL_INICIAL);
      }
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel carregar o perfil: ' + error.message);
    } finally {
      setCarregandoPerfil(false);
    }
  };

  const salvarPerfil = async () => {
    if (!usuario || !perfilForm.nome.trim()) {
      Alert.alert('Erro', 'Informe o nome do perfil.');
      return;
    }
    setAcaoEmAndamento(true);
    try {
      if (editandoPerfil) {
        await updateDoc(doc(db, 'usuarios', usuario.uid), {
          nome: perfilForm.nome.trim(),
          telefone: perfilForm.telefone.trim(),
          cidade: perfilForm.cidade.trim(),
          foto: (perfilForm.foto || 'icon:person-circle-outline').trim(),
          atualizadoEm: serverTimestamp(),
        });
        Alert.alert('Sucesso', 'Perfil atualizado.');
      } else {
        await setDoc(
          doc(db, 'usuarios', usuario.uid),
          {
            nome: perfilForm.nome.trim(),
            email: usuario.email,
            telefone: perfilForm.telefone.trim(),
            cidade: perfilForm.cidade.trim(),
            foto: (perfilForm.foto || 'icon:person-circle-outline').trim(),
            criadoEm: serverTimestamp(),
          },
          { merge: true }
        );
        Alert.alert('Sucesso', 'Perfil criado com sucesso.');
      }
      await carregarPerfil();
      setTelaPrivada('perfil');
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel salvar perfil: ' + error.message);
    } finally {
      setAcaoEmAndamento(false);
    }
  };

  const excluirPerfil = () => {
    Alert.alert('Excluir perfil', 'Deseja realmente excluir o perfil e a conta?', [
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
            Alert.alert('Conta removida', 'Perfil excluido com sucesso.');
          } catch (error) {
            Alert.alert('Erro', 'Nao foi possivel excluir: ' + error.message);
          } finally {
            setAcaoEmAndamento(false);
          }
        },
      },
    ]);
  };

  const carregarOcorrencias = async () => {
    if (!usuario) return;
    setCarregandoOcorrencias(true);
    try {
      const snapshot = await getDocs(
        query(collection(db, 'ocorrencias'), where('uid', '==', usuario.uid))
      );
      const dados = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      dados.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0));
      setOcorrencias(dados);
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel carregar ocorrencias: ' + error.message);
    } finally {
      setCarregandoOcorrencias(false);
    }
  };

  const carregarMapaPrincipal = async () => {
    setCarregandoMapa(true);
    try {
      let origem = null;
      const permissao = await Location.requestForegroundPermissionsAsync();
      if (permissao.granted) {
        const posicao = await Location.getCurrentPositionAsync({});
        origem = {
          latitude: posicao.coords.latitude,
          longitude: posicao.coords.longitude,
        };
        setLocalAtual(origem);
      }

      const snapshot = await getDocs(collection(db, 'ocorrencias'));
      const todos = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      const comCoordenadas = todos.filter(
        (item) => typeof item.latitude === 'number' && typeof item.longitude === 'number'
      );

      if (!origem) {
        setOcorrenciasProximas(comCoordenadas.slice(0, 50));
      } else {
        const proximas = comCoordenadas
          .map((item) => ({
            ...item,
            distanciaKm: calcularDistanciaKm(
              origem.latitude,
              origem.longitude,
              item.latitude,
              item.longitude
            ),
          }))
          .filter((item) => item.distanciaKm <= 10)
          .sort((a, b) => a.distanciaKm - b.distanciaKm);

        setOcorrenciasProximas(proximas);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar mapa de perigos: ' + error.message);
    } finally {
      setCarregandoMapa(false);
    }
  };

  const abrirNovaOcorrencia = () => {
    setOcorrenciaAtual(OCORRENCIA_INICIAL);
    setEditandoOcorrencia(false);
    setTelaPrivada('ocorrenciaForm');
  };

  const editarOcorrencia = (item) => {
    setOcorrenciaAtual({
      id: item.id,
      tipo: item.tipo || '',
      descricao: item.descricao || '',
      local: item.local || '',
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
      risco: item.risco || 'Medio',
      validadeHoras: String(item.validadeHoras || '4'),
    });
    setEditandoOcorrencia(true);
    setTelaPrivada('ocorrenciaForm');
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
            await Promise.all([carregarOcorrencias(), carregarMapaPrincipal()]);
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

  const abrirMapaSelecao = async () => {
    try {
      if (ocorrenciaAtual.latitude !== null && ocorrenciaAtual.longitude !== null) {
        setRegiaoMapa((atual) => ({
          ...atual,
          latitude: ocorrenciaAtual.latitude,
          longitude: ocorrenciaAtual.longitude,
        }));
      }
      const permissao = await Location.requestForegroundPermissionsAsync();
      if (permissao.granted) {
        const ultimaPosicao = await Location.getLastKnownPositionAsync();
        if (ultimaPosicao?.coords) {
          setRegiaoMapa((atual) => ({
            ...atual,
            latitude: ultimaPosicao.coords.latitude,
            longitude: ultimaPosicao.coords.longitude,
          }));
          return;
        }
        const posicao = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          maximumAge: 10000,
        });
        setRegiaoMapa((atual) => ({
          ...atual,
          latitude: posicao.coords.latitude,
          longitude: posicao.coords.longitude,
        }));
      }
    } catch (error) {
      // Usa regiao padrao.
    }
  };

  const selecionarCoordenadasMapa = (evento) => {
    const { latitude, longitude } = evento.nativeEvent.coordinate;
    setOcorrenciaAtual((anterior) => ({
      ...anterior,
      latitude,
      longitude,
      local: `Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`,
    }));
  };

  const salvarOcorrencia = async () => {
    if (!usuario) return;
    if (!ocorrenciaAtual.tipo.trim() || !ocorrenciaAtual.descricao.trim()) {
      Alert.alert('Erro', 'Preencha tipo e descricao.');
      return;
    }
    if (ocorrenciaAtual.latitude === null || ocorrenciaAtual.longitude === null) {
      Alert.alert('Erro', 'Selecione o local no mapa.');
      return;
    }
    if (!Number(ocorrenciaAtual.validadeHoras) || Number(ocorrenciaAtual.validadeHoras) <= 0) {
      Alert.alert('Erro', 'Validade em horas invalida.');
      return;
    }
    setAcaoEmAndamento(true);
    try {
      const payload = {
        uid: usuario.uid,
        tipo: ocorrenciaAtual.tipo.trim(),
        descricao: ocorrenciaAtual.descricao.trim(),
        local: ocorrenciaAtual.local.trim(),
        latitude: ocorrenciaAtual.latitude,
        longitude: ocorrenciaAtual.longitude,
        risco: ocorrenciaAtual.risco,
        validadeHoras: Number(ocorrenciaAtual.validadeHoras),
        expiraEm: new Date(Date.now() + Number(ocorrenciaAtual.validadeHoras) * 60 * 60 * 1000),
      };
      let ocorrenciaSalvaId = ocorrenciaAtual.id;
      if (editandoOcorrencia) {
        await updateDoc(doc(db, 'ocorrencias', ocorrenciaAtual.id), {
          ...payload,
          atualizadoEm: serverTimestamp(),
        });
        Alert.alert('Sucesso', 'Ocorrencia atualizada.');
      } else {
        const docRef = await addDoc(collection(db, 'ocorrencias'), {
          ...payload,
          criadoEm: serverTimestamp(),
        });
        ocorrenciaSalvaId = docRef.id;
        Alert.alert('Sucesso', 'Ocorrencia cadastrada.');
      }
      const ocorrenciaSalva = {
        id: ocorrenciaSalvaId,
        ...payload,
      };
      setOcorrencias((anteriores) => {
        const semDuplicadas = anteriores.filter((item) => item.id !== ocorrenciaSalvaId);
        return [ocorrenciaSalva, ...semDuplicadas];
      });
      setOcorrenciasProximas((anteriores) => {
        const semDuplicadas = anteriores.filter((item) => item.id !== ocorrenciaSalvaId);
        const distanciaKm = localAtual
          ? calcularDistanciaKm(
              localAtual.latitude,
              localAtual.longitude,
              ocorrenciaSalva.latitude,
              ocorrenciaSalva.longitude
            )
          : 0;
        const dentroDoRaio = !localAtual || distanciaKm <= 10;
        if (!dentroDoRaio) return semDuplicadas;
        return [{ ...ocorrenciaSalva, distanciaKm }, ...semDuplicadas].sort(
          (a, b) => (a.distanciaKm ?? 0) - (b.distanciaKm ?? 0)
        );
      });
      setOcorrenciaAtual(OCORRENCIA_INICIAL);
      setEditandoOcorrencia(false);
      setTelaPrivada('mapa');
      carregarOcorrencias();
      carregarMapaPrincipal();
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel salvar a ocorrencia: ' + error.message);
    } finally {
      setAcaoEmAndamento(false);
    }
  };

  const abrirFormPerfil = (editar) => {
    setEditandoPerfil(editar);
    if (!editar && !perfil) setPerfilForm(PERFIL_INICIAL);
    setTelaPrivada('perfilForm');
  };

  const renderConteudoPrivado = () => {
    if (telaPrivada === 'perfilForm') {
      return (
        <ProfileFormScreen
          perfilForm={perfilForm}
          setPerfilForm={setPerfilForm}
          onCancel={() => setTelaPrivada('perfil')}
          onSubmit={salvarPerfil}
          editando={editandoPerfil}
        />
      );
    }

    if (telaPrivada === 'ocorrenciaForm') {
      return (
        <OccurrenceFormScreen
          ocorrenciaAtual={ocorrenciaAtual}
          setOcorrenciaAtual={setOcorrenciaAtual}
          editandoOcorrencia={editandoOcorrencia}
          tiposPerigo={TIPOS_PERIGO}
          regiaoMapa={regiaoMapa}
          abrirMapaSelecao={abrirMapaSelecao}
          selecionarCoordenadasMapa={selecionarCoordenadasMapa}
          onCancel={() => setTelaPrivada('ocorrencias')}
          onSubmit={salvarOcorrencia}
        />
      );
    }

    if (telaPrivada === 'perfil') {
      return (
        <ProfileScreen
          carregandoPerfil={carregandoPerfil}
          perfil={perfil}
          usuario={usuario}
          avatarUsuario={avatarUsuario}
          onOpenProfileForm={abrirFormPerfil}
          onDeleteProfile={excluirPerfil}
        />
      );
    }

    if (telaPrivada === 'ocorrencias') {
      return (
        <OccurrencesListScreen
          carregandoOcorrencias={carregandoOcorrencias}
          ocorrencias={ocorrencias}
          onNova={abrirNovaOcorrencia}
          onEditar={editarOcorrencia}
          onExcluir={excluirOcorrencia}
        />
      );
    }

    return (
      <HomeMapScreen
        carregandoMapa={carregandoMapa}
        ocorrenciasProximas={ocorrenciasProximas}
        localAtual={localAtual}
        regiaoPadrao={REGIAO_PADRAO}
        onRefresh={carregarMapaPrincipal}
        onGoPerfil={() => setTelaPrivada('perfil')}
        onGoOcorrencias={() => setTelaPrivada('ocorrencias')}
      />
    );
  };

  const tituloTelaAtual = () => {
    if (!usuario) return abaPublica === 'login' ? 'Tela de Login' : 'Tela de Cadastro';
    if (telaPrivada === 'mapa') return 'Mapa de Perigos Próximos';
    if (telaPrivada === 'perfil') return 'Perfil';
    if (telaPrivada === 'ocorrencias') return 'Ocorrências';
    if (telaPrivada === 'perfilForm') return editandoPerfil ? 'Editar Perfil' : 'Novo Perfil';
    return editandoOcorrencia ? 'Editar Ocorrência' : 'Nova Ocorrência';
  };

  const mostrarLogoNoHeader = !usuario || telaPrivada === 'mapa';
  const mostrarSetaVoltar = usuario && telaPrivada !== 'mapa';

  const voltarTelaPrivada = () => {
    if (telaPrivada === 'perfilForm') {
      setTelaPrivada('perfil');
      return;
    }
    if (telaPrivada === 'ocorrenciaForm') {
      setTelaPrivada('ocorrencias');
      return;
    }
    if (telaPrivada === 'perfil' || telaPrivada === 'ocorrencias') {
      setTelaPrivada('mapa');
    }
  };

  const abrirTelaDoMenu = (proximaTela) => {
    setMenuVisible(false);
    setTelaPrivada(proximaTela);
  };

  const deslogarPeloMenu = () => {
    setMenuVisible(false);
    sair();
  };

  if (carregandoAuth) {
    return (
      <PaperProvider theme={tema}>
        <SafeAreaProvider>
          <View style={styles.loadingContainer}>
            <Appbar.Header style={styles.appbar}>
              <Appbar.Content title="SafeZone" />
            </Appbar.Header>
          </View>
        </SafeAreaProvider>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={tema}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <Appbar.Header style={styles.appbar}>
            {mostrarSetaVoltar ? (
              <Appbar.Action icon="arrow-left" onPress={voltarTelaPrivada} />
            ) : null}

            {mostrarLogoNoHeader ? (
              <View style={styles.appbarBrandContainer}>
                <Image
                  source={require('./assets/principal.png')}
                  style={styles.appbarLogo}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <Appbar.Content title={tituloTelaAtual()} titleStyle={styles.appbarTitle} />
            )}

            {usuario ? (
              <Appbar.Action
                icon={menuVisible ? 'close' : 'menu'}
                onPress={() => setMenuVisible((estadoAnterior) => !estadoAnterior)}
              />
            ) : null}
          </Appbar.Header>

          {usuario && menuVisible ? (
            <Portal>
              <View style={styles.menuOverlayContainer}>
                <Pressable style={styles.menuOverlayBackdrop} onPress={() => setMenuVisible(false)}>
                  {telaPrivada === 'mapa' ? (
                    <BlurView intensity={34} tint="dark" style={StyleSheet.absoluteFill} />
                  ) : (
                    <View style={styles.menuOverlayEscuro} />
                  )}
                </Pressable>

                <View style={styles.menuDropdown}>
                  <Pressable style={styles.menuItem} onPress={() => abrirTelaDoMenu('mapa')}>
                    <MaterialCommunityIcons name="map-marker-radius" size={20} color={CORES.primaria} />
                    <Text style={styles.menuItemTexto}>Mapa principal</Text>
                  </Pressable>

                  <Pressable style={styles.menuItem} onPress={() => abrirTelaDoMenu('perfil')}>
                    <MaterialCommunityIcons name="account-circle-outline" size={20} color={CORES.primaria} />
                    <Text style={styles.menuItemTexto}>Perfil</Text>
                  </Pressable>

                  <Pressable style={styles.menuItem} onPress={() => abrirTelaDoMenu('ocorrencias')}>
                    <MaterialCommunityIcons name="alert-outline" size={20} color={CORES.primaria} />
                    <Text style={styles.menuItemTexto}>Ocorrências</Text>
                  </Pressable>

                  <Pressable style={[styles.menuItem, styles.menuItemUltimo]} onPress={deslogarPeloMenu}>
                    <MaterialCommunityIcons name="logout" size={20} color={CORES.primaria} />
                    <Text style={styles.menuItemTexto}>Deslogar</Text>
                  </Pressable>
                </View>
              </View>
            </Portal>
          ) : null}

          {!usuario ? (
            <AuthScreen
              abaPublica={abaPublica}
              setAbaPublica={setAbaPublica}
              emailLogin={emailLogin}
              setEmailLogin={setEmailLogin}
              senhaLogin={senhaLogin}
              setSenhaLogin={setSenhaLogin}
              nomeCadastro={nomeCadastro}
              setNomeCadastro={setNomeCadastro}
              emailCadastro={emailCadastro}
              setEmailCadastro={setEmailCadastro}
              senhaCadastro={senhaCadastro}
              setSenhaCadastro={setSenhaCadastro}
              confirmarSenha={confirmarSenha}
              setConfirmarSenha={setConfirmarSenha}
              ocultarSenhaLogin={ocultarSenhaLogin}
              setOcultarSenhaLogin={setOcultarSenhaLogin}
              ocultarSenhaCadastro={ocultarSenhaCadastro}
              setOcultarSenhaCadastro={setOcultarSenhaCadastro}
              ocultarConfirmacaoSenha={ocultarConfirmacaoSenha}
              setOcultarConfirmacaoSenha={setOcultarConfirmacaoSenha}
              acaoEmAndamento={acaoEmAndamento}
              fazerLogin={fazerLogin}
              cadastrarUsuario={cadastrarUsuario}
            />
          ) : (
            <View style={telaPrivada === 'mapa' ? styles.areaPrivadaMapa : styles.areaPrivada}>
              {renderConteudoPrivado()}
            </View>
          )}
        </View>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  appbar: {
    backgroundColor: CORES.primaria,
  },
  appbarBrandContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 8,
    alignItems: 'center',
  },
  appbarLogo: {
    width: '80%',
    height: '100%',
  },
  appbarTitle: {
    color: CORES.fundo,
    fontWeight: '700',
  },
  areaPrivada: {
    flex: 1,
    padding: 12,
  },
  areaPrivadaMapa: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  menuOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
  },
  menuOverlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuOverlayEscuro: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
  },
  menuDropdown: {
    position: 'absolute',
    top: 78,
    right: 12,
    width: 230,
    backgroundColor: CORES.fundo,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuItem: {
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuItemUltimo: {
    marginTop: 2,
  },
  menuItemTexto: {
    color: CORES.primaria,
    fontSize: 15,
    fontWeight: '700',
  },
});
