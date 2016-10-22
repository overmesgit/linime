ssh -t -o StrictHostKeyChecking=no -i /tmp/ssh/lite 'mkdir -p /root/build'
ssh -t -o StrictHostKeyChecking=no -i /tmp/ssh/lite 'rm -r /root/build/linime'
ssh -t -o StrictHostKeyChecking=no -i /tmp/ssh/lite 'mkdir -p /root/build/linime'
scp -r -o StrictHostKeyChecking=no -i /tmp/ssh/lite * root@linime.animesos.net:/root/build/linime