# Bindass Luxury Ecommerce

## Project Structure

- **/client**: React.js Frontend
- **/server**: Node.js/Express Backend
- **/k8s**: Kubernetes Manifests
- **/n8n-workflows**: Automation workflows

## Getting Started

### Local Development

1. Run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Kubernetes Deployment

1. Apply manifests:
   ```bash
   kubectl apply -f k8s/
   ```
