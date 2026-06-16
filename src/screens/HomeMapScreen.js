import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, IconButton, Paragraph, Text } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import { CORES } from '../theme';

export default function HomeMapScreen({
  carregandoMapa,
  ocorrenciasProximas,
  localAtual,
  regiaoPadrao,
  onRefresh,
  onGoPerfil,
  onGoOcorrencias,
}) {
  const regiaoInicial = localAtual
    ? {
        latitude: localAtual.latitude,
        longitude: localAtual.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }
    : regiaoPadrao;

  if (carregandoMapa) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CORES.secundaria} />
        <Text style={styles.loadingText}>Carregando perigos próximos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.mapa} initialRegion={regiaoInicial} showsUserLocation>
        {ocorrenciasProximas.map((item) => (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            pinColor="#ef4444"
            title={item.tipo}
            description={item.descricao}
          />
        ))}
      </MapView>

      <View style={styles.infoCard}>
        <Paragraph style={styles.infoText}>
          {ocorrenciasProximas.length} perigo(s) proximo(s) encontrado(s)
        </Paragraph>
      </View>

      <View style={styles.footerMenu}>
        <View style={styles.footerItem}>
          <IconButton icon="refresh" iconColor="#FFFFFF" size={24} onPress={onRefresh} />
          <Text style={styles.footerLabel}>Recarregar</Text>
        </View>
        <View style={styles.footerItem}>
          <IconButton
            icon="alert-circle-outline"
            iconColor="#FFFFFF"
            size={24}
            onPress={onGoOcorrencias}
          />
          <Text style={styles.footerLabel}>Ocorrências</Text>
        </View>
        <View style={styles.footerItem}>
          <IconButton icon="account-circle" iconColor="#FFFFFF" size={24} onPress={onGoPerfil} />
          <Text style={styles.footerLabel}>Perfil</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  mapa: {
    flex: 1,
  },
  infoCard: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 54,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 14,
    padding: 12,
  },
  infoText: {
    marginBottom: 8,
    color: CORES.textoPrincipal,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CORES.fundo,
  },
  loadingText: {
    marginTop: 8,
    color: '#FFFFFF',
  },
  footerMenu: {
    position: 'absolute',
    bottom: -5,
    left: -5,
    right: -5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: CORES.fundo,
    borderTopWidth: 1,
    borderTopColor: '#1f2a3a',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 40,
    paddingBottom: 20,
  },
  footerItem: {
    alignItems: 'center',
    bottom: 30
  },
  footerLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: -8,
  },
});
