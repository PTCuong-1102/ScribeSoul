#!/bin/bash

# Hook Management Utility for ScribeSoul
# Usage: ./scripts/manage-hooks.sh [enable|disable|status|reinstall]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HUSKY_DIR="$PROJECT_ROOT/.husky"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
  echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
  echo -e "${GREEN}✅${NC} $1"
}

print_error() {
  echo -e "${RED}❌${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠️ ${NC} $1"
}

enable_hooks() {
  print_status "Enabling Git hooks..."
  cd "$PROJECT_ROOT"
  
  if [ ! -d "$HUSKY_DIR" ]; then
    print_error "Husky not initialized. Run: npm run prepare"
    exit 1
  fi
  
  # Make hooks executable
  if [ -f "$HUSKY_DIR/pre-commit" ]; then
    chmod +x "$HUSKY_DIR/pre-commit"
    print_success "Pre-commit hook enabled"
  fi
  
  if [ -f "$HUSKY_DIR/pre-push" ]; then
    chmod +x "$HUSKY_DIR/pre-push"
    print_success "Pre-push hook enabled"
  fi
  
  print_success "All hooks enabled!"
}

disable_hooks() {
  print_status "Disabling Git hooks..."
  cd "$PROJECT_ROOT"
  
  if [ -d "$HUSKY_DIR" ]; then
    rm -rf "$HUSKY_DIR"
    print_success "Husky hooks disabled"
  else
    print_warning "Husky not found"
  fi
}

show_status() {
  print_status "Checking hook status..."
  cd "$PROJECT_ROOT"
  
  if [ ! -d "$HUSKY_DIR" ]; then
    print_error "Husky not initialized"
    echo ""
    echo "To enable hooks, run:"
    echo "  npm run prepare"
    exit 1
  fi
  
  echo ""
  print_status "Hook files:"
  
  if [ -f "$HUSKY_DIR/pre-commit" ]; then
    if [ -x "$HUSKY_DIR/pre-commit" ]; then
      print_success "pre-commit (enabled)"
    else
      print_error "pre-commit (disabled - not executable)"
    fi
  else
    print_error "pre-commit (not found)"
  fi
  
  if [ -f "$HUSKY_DIR/pre-push" ]; then
    if [ -x "$HUSKY_DIR/pre-push" ]; then
      print_success "pre-push (enabled)"
    else
      print_error "pre-push (disabled - not executable)"
    fi
  else
    print_error "pre-push (not found)"
  fi
  
  echo ""
  print_status "Git hooks directory status:"
  if [ -d ".git/hooks" ]; then
    echo "  .git/hooks found ✓"
    if [ -L ".git/hooks/pre-commit" ] || [ -f ".git/hooks/pre-commit" ]; then
      echo "  pre-commit hook: installed"
    fi
    if [ -L ".git/hooks/pre-push" ] || [ -f ".git/hooks/pre-push" ]; then
      echo "  pre-push hook: installed"
    fi
  fi
  
  echo ""
}

reinstall_hooks() {
  print_status "Reinstalling Git hooks..."
  cd "$PROJECT_ROOT"
  
  print_status "Step 1: Removing old installation..."
  if [ -d "$HUSKY_DIR" ]; then
    rm -rf "$HUSKY_DIR"
    print_success "Old installation removed"
  fi
  
  print_status "Step 2: Installing Husky..."
  npm run prepare
  
  print_status "Step 3: Making hooks executable..."
  enable_hooks
  
  print_success "All hooks reinstalled!"
  show_status
}

# Main
case "${1:-status}" in
  enable)
    enable_hooks
    ;;
  disable)
    disable_hooks
    ;;
  status)
    show_status
    ;;
  reinstall)
    reinstall_hooks
    ;;
  *)
    echo "Usage: $0 [enable|disable|status|reinstall]"
    echo ""
    echo "Commands:"
    echo "  enable      - Enable all Git hooks"
    echo "  disable     - Disable all Git hooks (removes .husky)"
    echo "  status      - Show hook status"
    echo "  reinstall   - Reinstall Husky from scratch"
    echo ""
    echo "Examples:"
    echo "  ./scripts/manage-hooks.sh status"
    echo "  ./scripts/manage-hooks.sh reinstall"
    exit 1
    ;;
esac
