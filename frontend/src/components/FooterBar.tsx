import { Anchor, Container, Flex, Group, Stack, Text } from '@mantine/core'

export function FooterBar() {
  return (
    <Container size="xl" h="100%">
      <Flex
        justify="space-between"
        align="center"
        h="100%"
        direction={{ base: 'column', sm: 'row' }}
        gap={{ base: 'xs', sm: 'md' }}
        py={{ base: 8, sm: 0 }}
      >
        <Stack gap={2} align="center" w={{ base: '100%', sm: 'auto' }}>
          <Text size="sm" c="dimmed" ta={{ base: 'center', sm: 'left' }}>
            © {new Date().getFullYear()} Taupunktmonitor · Raspberry Pi Sensorboard
          </Text>
          <Text size="xs" c="dimmed" ta={{ base: 'center', sm: 'left' }}>
            Frontend: Malte Ehmen · Backend: Sönke Klock
          </Text>
        </Stack>

        <Group gap="md" justify="center" wrap="wrap">
          <Anchor href="#live" c="dimmed" size="sm" underline="never">
            Live
          </Anchor>
          <Anchor href="#history" c="dimmed" size="sm" underline="never">
            Verlauf
          </Anchor>
        </Group>
      </Flex>
    </Container>
  )
}
