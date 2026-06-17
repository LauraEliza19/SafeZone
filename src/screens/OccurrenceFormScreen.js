import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Menu, Modal, Paragraph, Portal, TextInput, Title } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import { CORES } from '../theme';

export default function OccurrenceFormScreen({
  ocorrenciaAtual,
  setOcorrenciaAtual,
  editandoOcorrencia,
  tiposPerigo,
  regiaoMapa,
  abrirMapaSelecao,
  selecionarCoordenadasMapa,
  onCancel,
  onSubmit,
}) {
  const [menuTipoVisible, setMenuTipoVisible] = useState(false);
  const [menuRiscoVisible, setMenuRiscoVisible] = useState(false);
  const [mapaVisible, setMapaVisible] = useState(false);
  const riscos = ['Baixo', 'Medio', 'Alto'];

  const abrirMapa = () => {
    setMapaVisible(true);
    abrirMapaSelecao();
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Card.Content>
          <Menu
            visible={menuTipoVisible}
            onDismiss={() => setMenuTipoVisible(false)}
            anchor={
              <Button
                mode="contained"
                icon="alert-outline"
                style={styles.fieldButton}
                buttonColor="#FFFFFF"
                textColor={CORES.fundo}
                onPress={() => setMenuTipoVisible(true)}
                contentStyle={styles.fieldButtonContent}
                labelStyle={styles.fieldButtonLabel}
              >
                {ocorrenciaAtual.tipo || 'Selecionar tipo de perigo'}
              </Button>
            }
          >
            {tiposPerigo.map((tipo) => (
              <Menu.Item
                key={tipo}
                onPress={() => {
                  setOcorrenciaAtual((anterior) => ({ ...anterior, tipo }));
                  setMenuTipoVisible(false);
                }}
                title={tipo}
              />
            ))}
          </Menu>

            <Button
              mode="contained"
              icon="map-marker-radius-outline"
              onPress={abrirMapa}
              style={styles.fieldButton}
              buttonColor="#FFFFFF"
              textColor={CORES.fundo}
              contentStyle={styles.fieldButtonContent}
              labelStyle={styles.fieldButtonLabel}
            >
              Selecionar local no mapa
            </Button>
            <Paragraph style={styles.coordenadaText}>
              {ocorrenciaAtual.latitude !== null && ocorrenciaAtual.longitude !== null
                ? `Coordenadas: ${Number(ocorrenciaAtual.latitude).toFixed(5)}, ${Number(
                    ocorrenciaAtual.longitude
                  ).toFixed(5)}`
                : 'Nenhuma coordenada selecionada.'}
            </Paragraph>

            <Menu
              visible={menuRiscoVisible}
              onDismiss={() => setMenuRiscoVisible(false)}
              anchor={
                <Button
                  mode="contained"
                  icon="shield-alert-outline"
                  style={styles.fieldButton}
                  buttonColor="#FFFFFF"
                  textColor={CORES.fundo}
                  onPress={() => setMenuRiscoVisible(true)}
                  contentStyle={styles.fieldButtonContent}
                  labelStyle={styles.fieldButtonLabel}
                >
                  Risco: {ocorrenciaAtual.risco}
                </Button>
              }
            >
              {riscos.map((risco) => (
                <Menu.Item
                  key={risco}
                  onPress={() => {
                    setOcorrenciaAtual((anterior) => ({ ...anterior, risco }));
                    setMenuRiscoVisible(false);
                  }}
                  title={risco}
                />
              ))}
            </Menu>
            <TextInput
              label="Validade em horas"
              value={ocorrenciaAtual.validadeHoras}
              onChangeText={(text) =>
                setOcorrenciaAtual({ ...ocorrenciaAtual, validadeHoras: text })
              }
              mode="outlined"
              style={styles.fieldInput}
              outlineStyle={styles.fieldInputOutline}
              outlineColor="transparent"
              activeOutlineColor="transparent"
              left={<TextInput.Icon icon="clock-time-four-outline" color={CORES.fundo} />}
              keyboardType="numeric"
              textColor={CORES.fundo}
              cursorColor={CORES.secundaria}
              selectionColor={CORES.secundaria}
            />
            <TextInput
              label="Descricao"
              value={ocorrenciaAtual.descricao}
              onChangeText={(text) =>
                setOcorrenciaAtual({ ...ocorrenciaAtual, descricao: text })
              }
              mode="outlined"
              style={[styles.fieldInput, styles.fieldInputDescricao]}
              outlineStyle={styles.fieldInputOutline}
              outlineColor="transparent"
              activeOutlineColor="transparent"
              left={<TextInput.Icon icon="text-box-outline" color={CORES.fundo} />}
              multiline
              textColor={CORES.fundo}
              cursorColor={CORES.secundaria}
              selectionColor={CORES.secundaria}
            />
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
                icon={editandoOcorrencia ? 'check' : 'plus'}
                onPress={onSubmit}
                style={styles.flexButton}
                buttonColor={CORES.fundo}
                textColor="#FFFFFF"
              >
                {editandoOcorrencia ? 'Atualizar' : 'Salvar'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Modal
          visible={mapaVisible}
          onDismiss={() => setMapaVisible(false)}
          contentContainerStyle={styles.modalMapaContainer}
        >
          <Card>
            <Card.Content>
              <Title>Selecionar local da ocorrencia</Title>
              <Paragraph style={styles.mapHelperText}>
                Toque no mapa para escolher o ponto exato.
              </Paragraph>
              <MapView
                style={styles.mapa}
                initialRegion={regiaoMapa}
                onPress={(event) => selecionarCoordenadasMapa(event)}
              >
                {ocorrenciaAtual.latitude !== null && ocorrenciaAtual.longitude !== null ? (
                  <Marker
                    coordinate={{
                      latitude: ocorrenciaAtual.latitude,
                      longitude: ocorrenciaAtual.longitude,
                    }}
                  />
                ) : null}
              </MapView>
              <View style={styles.rowButtons}>
                <Button
                  mode="contained"
                  onPress={() => setMapaVisible(false)}
                  style={styles.flexButton}
                  buttonColor={CORES.fundo}
                  textColor="#FFFFFF"
                >
                  Fechar
                </Button>
                <Button
                  mode="contained"
                  onPress={() => setMapaVisible(false)}
                  style={styles.flexButton}
                  buttonColor={CORES.fundo}
                  textColor="#FFFFFF"
                  icon="check"
                >
                  Confirmar
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
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
  fieldInput: {
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  fieldInputDescricao: {
    minHeight: 130,
  },
  fieldInputOutline: {
    borderRadius: 14,
    borderWidth: 0,
  },
  fieldButton: {
    marginBottom: 12,
    borderRadius: 14,
  },
  fieldButtonContent: {
    minHeight: 54,
    justifyContent: 'flex-start',
  },
  fieldButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  coordenadaText: { marginBottom: 12, color: CORES.textoSecundario },
  rowButtons: { marginTop: 14, flexDirection: 'row', gap: 8 },
  flexButton: { flex: 1 },
  modalMapaContainer: { margin: 16 },
  mapHelperText: { marginBottom: 10, color: CORES.textoSecundario },
  mapa: { height: 280, borderRadius: 12, marginBottom: 12 },
});
