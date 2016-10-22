ssh -o StrictHostKeyChecking=no -i /tmp/ssh/lite root@linime.animesos.net 'mkdir -p /root/build'
ssh -o StrictHostKeyChecking=no -i /tmp/ssh/lite root@linime.animesos.net 'rm -r /root/build/linime'
ssh -o StrictHostKeyChecking=no -i /tmp/ssh/lite root@linime.animesos.net 'mkdir -p /root/build/linime'
scp -r -o StrictHostKeyChecking=no -i /tmp/ssh/lite * root@linime.animesos.net:/root/build/linime