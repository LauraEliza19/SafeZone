import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Paragraph, Text, Title } from 'react-native-paper';
import { CORES } from '../theme';

export default function OccurrencesListScreen({
  carregandoOcorrencias,
  ocorrencias,
  onNova,
  onEditar,
  onExcluir,
}) {
  return (
    <View style={styles.fullHeight}>
      <View style={styles.headerLista}>
        <Button
          mode="contained"
          icon="plus"
          onPress={onNova}
          buttonColor="#FFFFFF"
          textColor={CORES.secundaria}
        >
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
                {item.latitude && item.longitude ? (
                  <Paragraph>
                    Coordenadas: {Number(item.latitude).toFixed(5)}, {Number(item.longitude).toFixed(5)}
                  </Paragraph>
                ) : null}
                <Paragraph>Validade: {item.validadeHoras}h</Paragraph>
                <View style={styles.rowButtons}>
                  <Button
                    mode="contained"
                    icon="pencil"
                    onPress={() => onEditar(item)}
                    style={styles.flexButton}
                    buttonColor={CORES.fundo}
                    textColor="#FFFFFF"
                  >
                    Editar
                  </Button>
                  <Button
                    mode="contained"
                    icon="delete"
                    onPress={() => onExcluir(item)}
                    style={styles.flexButton}
                    buttonColor={CORES.fundo}
                    textColor="#FFFFFF"
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
}

const styles = StyleSheet.create({
  fullHeight: { flex: 1 },
  headerLista: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: { marginTop: 8, color: CORES.textoSecundario },
  card: { marginBottom: 10 },
  linhaEntre: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rowButtons: { marginTop: 14, flexDirection: 'row', gap: 8 },
  flexButton: { flex: 1 },
});
