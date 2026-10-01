# Instala o Plumb para o Claude Code, o Cursor ou os dois.
#   .\install.ps1                         # Claude Code, global (~/.claude)
#   .\install.ps1 -Target cursor          # Cursor, global (~/.cursor)
#   .\install.ps1 -Target both            # os dois
#   .\install.ps1 -Target both -Project   # só no projeto atual (.claude/ e .cursor/)
param(
  [ValidateSet('claude', 'cursor', 'both')][string]$Target = 'claude',
  [switch]$Project
)
$ErrorActionPreference = 'Stop'
$src  = $PSScriptRoot
$base = if ($Project) { (Get-Location).Path } else { $HOME }
$utf8 = New-Object System.Text.UTF8Encoding($false)

function Copy-Skills($dest) {
  New-Item -ItemType Directory -Force $dest | Out-Null
  Get-ChildItem (Join-Path $src 'skills') -Directory | ForEach-Object {
    $to = Join-Path $dest $_.Name
    if (Test-Path $to) { Remove-Item -Recurse -Force $to }
    Copy-Item -Recurse $_.FullName $to
  }
  Write-Host "skills  -> $dest"
}

function Copy-Agents($dest, [switch]$ForCursor) {
  New-Item -ItemType Directory -Force $dest | Out-Null
  Get-ChildItem (Join-Path $src 'agents') -Filter '*.md' | ForEach-Object {
    $text = [IO.File]::ReadAllText($_.FullName)
    if ($ForCursor) {
      # O Cursor não documenta aliases de modelo nem effort/disallowedTools;
      # readonly: true (já no arquivo) é o que restringe os agentes de leitura.
      $text = $text -replace '(?m)^model: \w+\r?\n', "model: inherit`n"
      $text = $text -replace '(?m)^(effort|disallowedTools): .*\r?\n', ''
    }
    [IO.File]::WriteAllText((Join-Path $dest $_.Name), $text, $utf8)
  }
  Write-Host "agents  -> $dest"
}

if ($Target -in 'claude', 'both') {
  Copy-Skills (Join-Path $base '.claude\skills')
  Copy-Agents (Join-Path $base '.claude\agents')
}
if ($Target -in 'cursor', 'both') {
  # O Cursor também lê .claude/skills: com 'both', as skills não são duplicadas.
  if ($Target -eq 'cursor') { Copy-Skills (Join-Path $base '.cursor\skills') }
  Copy-Agents (Join-Path $base '.cursor\agents') -ForCursor
}
Write-Host 'Pronto. Em cada repositório, rode /plumb-setup.'
