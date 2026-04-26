import { Container, Flex, Paper, Stack, Text } from '@mantine/core'

export function FooterBar() {
  return (
    <Container size="xl" px={{ base: 4, xs: 'sm', sm: 'md' }}>
      <Paper className="glass-panel" px={{ base: 'sm', sm: 'lg' }} py={{ base: 'sm', sm: 'md' }} radius="xl">
        <Flex justify="space-between" align={{ base: 'flex-start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap={{ base: 'xs', sm: 'md' }}>
          <Stack gap={2}>
            <Text size="sm" fw={700}>
              Taupunktmonitor
            </Text>
            <Text size="sm" c="dimmed" className="wrap-anywhere">
              © {new Date().getFullYear()} Raspberry Pi Sensorboard, Verlauf und Lüftersteuerung.
            </Text>
            <Text size="xs" c="dimmed">
              Frontend: Malte Ehmen | Backend: Sönke Klock
            </Text>
          </Stack>
        </Flex>
      </Paper>
    </Container>
  )
}
