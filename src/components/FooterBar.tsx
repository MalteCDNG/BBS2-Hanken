import { Anchor, Container, Flex, Group, Stack, Text } from '@mantine/core'

export function FooterBar() {
  return (
    <Container size="xl" h="100%">
      <Flex justify="space-between" align="center" h="100%" direction={{ base: 'column', sm: 'row' }} gap="xs">
        <Stack gap={2} align="flex-start" w={{ base: '100%', sm: 'auto' }}>
          <Text size="sm" c="dimmed" ta={{ base: 'center', sm: 'left' }}>
            © {new Date().getFullYear()} Taupunktmonitor · Raspberry Pi Sensorboard
          </Text>
          <Text size="xs" c="dimmed" ta={{ base: 'center', sm: 'left' }}>
            Frontend: Malte Ehmen · Backend: Sönke Klock
          </Text>
        </Stack>
        <Group gap="md">
          <Anchor href="#live" c="dimmed" size="sm" underline="never">
            Live
          </Anchor>
          <Anchor href="#history" c="dimmed" size="sm" underline="never">
            Verlauf
          </Anchor>
          <Anchor href="#advice" c="dimmed" size="sm" underline="never">
            Hinweise
          </Anchor>
        </Group>
      </Flex>
    </Container>
  )
}
